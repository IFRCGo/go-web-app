"""A Kobo form definition, read as xpaths, labels and choice labels.

Kobo's /data/ answers in xpaths and codes - `intro_section/services_all:
"health cva"` - while people, and the Excel export the HSP layer was built
from, read labels: "Services offered (applies to ALL locations)/Health". This
module is the translation, built from the form's own definition
(/api/v2/assets/{uid}/ -> content.survey and content.choices) rather than from
a hand-kept table, so a relabelled choice in Kobo is a relabelled choice here.

Questions are FOUND BY LABEL, never by name. The label is what the Excel
parser anchored on, and it is what a person sees and edits in the form builder;
anchoring on the same thing keeps the two readers honest with each other.

Not a loader: nothing here touches the database, and it is imported by the
loaders that need it.
"""


def _label(value, fallback):
    """The first translation's label. A list is never joined: joining English and
    Arabic would produce a label nobody wrote."""
    if isinstance(value, list):
        value = value[0] if value else None
    return value if value not in (None, "") else fallback


def selected(answer):
    """A select_multiple answer as its codes. Kobo separates them with spaces."""
    return str(answer).split() if answer else []


class FormMap:
    def __init__(self, asset):
        content = asset.get("content", {})
        self._by_label = {}          # label -> xpath, first occurrence wins
        self._repeats = {}           # label -> xpath of a begin_repeat
        self._list_of = {}           # xpath -> choice list name
        self._choices = {}           # list name -> [(code, label)] in form order

        stack = []
        for row in content.get("survey", []):
            kind = row.get("type", "")
            name = row.get("name") or row.get("$autoname") or ""
            if kind in ("end_group", "end_repeat"):
                if stack:
                    stack.pop()
                continue
            xpath = "/".join(stack + [name])
            label = _label(row.get("label"), name)
            if kind == "begin_repeat":
                self._repeats.setdefault(label, xpath)
            if kind in ("begin_group", "begin_repeat"):
                stack.append(name)
                continue
            self._by_label.setdefault(label, xpath)
            if row.get("select_from_list_name"):
                self._list_of[xpath] = row["select_from_list_name"]

        for choice in content.get("choices", []):
            self._choices.setdefault(choice["list_name"], []).append(
                (choice["name"], _label(choice.get("label"), choice["name"])))
        self._choice_label = {
            list_name: dict(pairs) for list_name, pairs in self._choices.items()}

    def path_for_label(self, label, startswith=False):
        if not startswith:
            return self._by_label.get(label)
        return next((p for l, p in self._by_label.items() if l.startswith(label)), None)

    def repeat_path_for_label(self, label):
        return self._repeats.get(label)

    def choices_for(self, xpath):
        return list(self._choices.get(self._list_of.get(xpath), []))

    def choice_label(self, xpath, code):
        """The label for a code, or the code itself when the form no longer has it.

        A choice deleted after people chose it must not delete their answer: the
        raw code is ugly but true, and it shows up where someone can fix it.

        The one exception is Kobo's built-in "other": a question typed
        `select_multiple x or_other` accepts it, but it is not in the choice
        list, so it reads "Other" (the text typed sits in `<question>_other`).
        """
        labels = self._choice_label.get(self._list_of.get(xpath), {})
        if code == "other" and code not in labels:
            return "Other"
        return labels.get(code, code)
