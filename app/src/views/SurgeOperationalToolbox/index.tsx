import { type MouseEventHandler } from 'react';
import {
    Container,
    ExpandableContainer,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import OperationalTimelineBody from '#assets/content/operational_timeline_body.svg?react';
import OperationalTimelineTitle from '#assets/content/operational_timeline_title.svg?react';
import Link from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface OperationTimelineContent {
    id: string;
    url :string;
    name: string;
}
// NOTE: we do not need to translate this
const operationTimelineContent: OperationTimelineContent[] = [
    {
        id: 'surge_table/element1_31',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F01%2E%20Assessments&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Design, Collect, Analyze And Share',
    },
    {
        id: 'surge_table/element4',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eh2oMhgNSqdGmT43ZUYBzk0BZUk4BK3apoDFk-461u2EtQ',
        name: 'Launch DREF',
    },
    {
        id: 'surge_table/element5',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eu6-noLTkX5JmPAhaeDmQtcB2IEGx_mRnAQFNK8IwgiDCQ',
        name: 'Establish EA Funding Requirements',
    },
    {
        id: 'surge_table/element6',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Es4FC38i50hHnjMXLovQva0BNZRltQzPD0yKDP39a2g8DQ',
        name: 'Launch EA',
    },
    {
        id: 'surge_table/element4_3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eh6fh83QrctBri8qnV_nIgMBnL_PLJUO1Lo7bYZEzJi3SQ',
        name: 'Develop Response Options',
    },
    {
        id: 'surge_table/element4_4',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqgeyJbUWUtHqiGygkbzDlQBNFBgUHN26INuxRH4F9KoNQ',
        name: 'Complete Operational Strategy',
    },
    {
        id: 'surge_table/element4_5',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErnkTcrVFuhFupPbDRYEcd8BOAAnnGji1Jy-9og1kUVAuQ',
        name: 'Develop and update Implementation plan',
    },
    {
        id: 'surge_table/element1_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmONBUO8gDVArGtE4OD6skoB6JlOKL5qmU2OF4iv8v6Aiw',
        name: 'Create Risk Register',
    },
    {
        id: 'surge_table/element4_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EuU329vYiZhJnzYDHSZuIV8BSEccfQAabKTtnWliSMdBtA',
        name: 'Create Transition Plan',
    },
    {
        id: 'surge_table/element5_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EjN_meFam45BsqAYM0d9Tm0BHXnGsGxKqLAe5zpacYYWsA',
        name: 'Hold revised response options and planning workshops',
    },
    {
        id: 'surge_table/element6_2',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F02%2E%20Planning%2F02%2E09%20Revise%20Emergency%20Appeal%2DEPoA&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Revision to Emergency Appeal',
    },
    {
        id: 'surge_table/element7',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqU4PReiQ-FPm21whSQO3HUBqhLNfczLCzYxsqHZCh-2BA',
        name: 'Develop Initial Recovery Approach',
    },
    {
        id: 'surge_table/element8',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EkwZzW2JdFVEvydPtqH_gEABF6G5AuIHRcl8J_ReyEroow',
        name: 'Establish Task Forces',
    },
    {
        id: 'surge_table/element1',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoEvMuAQ97lOm7vibFy6OEYBfbdF5l0cDjGpNPMYH_uVLw?e=hffR2U',
        name: 'Design Collect Analyze',
    },
    {
        id: 'surge_table/element11',
        url: ' https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpflNbdSn4hMnnZ24mZ1X5ABnW8i_f3-IqGsPPjuI57ypw?e=aHoqNk',
        name: 'Hold in-country Movement Partner Meetings',
    },
    {
        id: 'surge_table/element9',
        url: 'https://www.sheltercluster.org/global',
        name: 'Activate Shelter Cluster',
    },
    {
        id: 'surge_table/element1_4',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErEYlKDN8r5Pops7rCADsjgBPNNrBv2G6Tbv-lCM7TpYtQ',
        name: 'Hold Mini Summit',
    },
    {
        id: 'surge_table/element1_3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElJyGf5pFExJgA8iwgkQXJIB4QWRL0EoDu4xGWsrOZFMCg',
        name: 'Create External Coordination Engagement Plan',
    },
    {
        id: 'surge_table/element8_2',
        url: 'https://smcctoolkit.org/tool-kit',
        name: 'Establish Movement Coordination Framework',
    },
    {
        id: 'surge_table/element10',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElUAIzfu4oxAuKPk3WUewvkBmUjIt1yPflN6v0PH-GNX_w?e=YGkbj5',
        name: 'Revise Movement Coordination Framework',
    },
    {
        id: 'surge_table/element30',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eo-iSVU8fjZMp9sJ3YWl8n8BwMVarYubQeLHVFiWfvPWVw?e=Nk2ZDK',
        name: 'Create Federation-Wide Joint Response Plan, Movement Picture',
    },
    {
        id: 'surge_table/element12',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/El814u3TtXlPracWs32VorIB_pULshHLHCus5wZuIRArpw',
        name: 'Send Surge Alert',
    },
    {
        id: 'surge_table/element13',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eq38VyX2Q39GmoFCOf2e4vcB1s8onYrxbHGNFcNap7BzRw',
        name: 'Workforce planning',
    },
    {
        id: 'surge_table/element13_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmHk4Z-OkdZIlfal90vzLHIB4p3CBV_ocOHCmMMuhS8HoA',
        name: 'Begin staff recruitment',
    },
    {
        id: 'surge_table/element1_5',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EhDClHP53pZGmGXse6Ef7vUBhanWIJY-CxsDmNGDceRARA',
        name: 'Report concerns',
    },
    {
        id: 'surge_table/element1_6',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmHk4Z-OkdZIlfal90vzLHIB4p3CBV_ocOHCmMMuhS8HoA',
        name: 'Begin staff recruitment - Update Organigram',
    },
    {
        id: 'surge_table/element14',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F04%2E%20HR%2F04%2E04%20Identify%20Surge%20Needs%20for%20Future%20Rotations&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Identify Surge Needs for Future Rotations',
    },
    {
        id: 'surge_table/element15',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F04%2E%20HR%2F04%2E06%20Post%20JDs%20for%20Standard%20Role%20Profiles&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Post JDs for Standard Role Profiles',
    },
    {
        id: 'surge_table/element16',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqZNZFoYcjhNqXVciAM5vuABjlGg4fvzwZHKeylvhtBGBQ',
        name: 'Complete End of Mission Steps',
    },
    {
        id: 'surge_table/element17',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eo01vTabxF9Aj27p6S3mSuoBbDN7ixfS_PRs0MHGUxyD2A',
        name: 'Create Sitreps',
    },
    {
        id: 'surge_table/element1_8',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ej7atMLNhOVBp9mqejlvk_sBp450NJB4-50ee1YjjErg_Q',
        name: 'Develop Ops Update 1',
    },
    {
        id: 'surge_table/element1_9',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ej7atMLNhOVBp9mqejlvk_sBp450NJB4-50ee1YjjErg_Q',
        name: 'Develop Ops Update 1',
    },
    {
        id: 'surge_table/element1_7',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoWr3j4-JXNIqxbmLiCQfA8B2QgMKxH7eZPv2sHS5tg-6g',
        name: 'Develop M&E Plan',
    },
    {
        id: 'surge_table/element18',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpbUfG-SUZ5Ap97uj4g4r9sBvSQW9RxLg5xVczuijS77cg',
        name: 'Create Indicator Tracking Table',
    },
    {
        id: 'surge_table/element19',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoWr3j4-JXNIqxbmLiCQfA8B2QgMKxH7eZPv2sHS5tg-6g',
        name: 'Revise M&E Plan',
    },
    {
        id: 'surge_table/element20',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvaYwaFc9TVDiV3_H4G03vgBt-h2RiABultu8pQPnSCCrA',
        name: 'Conduct Federation-Wide Reporting',
    },
    {
        id: 'surge_table/element21',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Egwg83-q2bREoEXPIfBTn5kBMbIUHX_utbt63rFJp8JsQw',
        name: 'Conduct RTE',
    },
    {
        id: 'surge_table/element1_10',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvlSgJM5xWVJp87dPDFefeMBCDndFtU-WtlpV9x7wskdUw',
        name: 'Define IM Strategy',
    },
    {
        id: 'surge_table/element1_11',
        url: 'https://rcrcsims.org',
        name: 'Activate SIMS',
    },
    {
        id: 'surge_table/tooltips_left_24',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F06%2E%20IM%2F06%2E03%20Produce%204W%20Map&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Produce 4W Map',
    },
    {
        id: 'surge_table/tooltips_left_25',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F06%2E%20IM%2F06%2E04%20Produce%20Presence%20and%20%26%20Response%20Map&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Produce Presence and & Response Map',
    },
    {
        id: 'surge_table/tooltips_top_11',
        url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F06%2E%20IM%2F06%2E05%20Setup%20Dashboards%20and%20Visualization%20%28GO%29&View=%7BA0DF7B8D%2DD671%2D4C77%2DA464%2D720655A5403E%7D',
        name: 'Setup Dashboards and Visualization (GO)',
    },
    {
        id: 'surge_table/element22',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElpuKM7mqitHlqGOrTAbdJwBhe7Pscaa21Pwv4kAEChJHw',
        name: 'Develop DREF Project Agreement',
    },
    {
        id: 'surge_table/element23',
        url: ' https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ek1-VTpEYqlCtS7fQ3uXNrcB0PqHfQ961Mu5s5AiTRk4og?e=MeZc8W',
        name: 'Develop Operating Budget',
    },
    {
        id: 'surge_table/element24_2',
        url: ' https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ek1-VTpEYqlCtS7fQ3uXNrcB0PqHfQ961Mu5s5AiTRk4og?e=MeZc8W',
        name: 'Revise Operating Budget',
    },
    {
        id: 'surge_table/element25',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Em0ZAEsalk5Jul1Uonrx8xwBJGSEZdbYyU5wAIUSOj_-fg',
        name: 'Develop Appeal Project Agreement',
    },
    {
        id: 'surge_table/element24',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvVyOV0vODNOhB_hMZi4Us0Bl9hB3hvrFY6fmS55IYyifg?e=uAro8S',
        name: 'PEAR',
    },
    {
        id: 'surge_table/element1_15',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EnL5Opb7DhJAuWwsNzGqQpIB4pqlXntVUm1XRY6AZBSgUA?e=lU4ULX',
        name: 'Develop Plan of Arrival',
    },
    {
        id: 'surge_table/element1_16',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EgouBf10MC1DgxcIDdRu5_kBd7iT2aXIQm_vdymzO6AZhw?e=TaLqnG',
        name: 'Develop Resource mobilization plan',
    },
    {
        id: 'surge_table/element1_17',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eo1XPZuxHRRLgArAv5NA7lkBmILPSH9fcMwZ_ajBZHKGUg?e=2VeVU9',
        name: 'Establish welcome service',
    },
    {
        id: 'surge_table/element27',
        url: ' https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Evym_hIX3HZFhzEqSUii9G8B9odeetryN5kXoFZiryJl6Q?e=2KXNnW',
        name: 'Partners Call',
    },
    {
        id: 'surge_table/element1_12',
        url: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed8QtQCbLzxHpp6cm7xR9WkBc8Qz0cx0k0oj1VgoL2aahw',
        name: 'Maintain GO Emergency Page',
    },
    {
        id: 'surge_table/element28',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EsF3Ei5eH4JKrAALHBWxVX4BnAm9i5-o-Z_VxVqgxvVMAg?e=aQAcpO',
        name: 'Update Resource Mobilization Tracking and Pledge Status',
    },
    {
        id: 'surge_table/element1_13',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EnpwY1GhzuRBmo7WAQ_7PQoBhi55A-zc3Eh1BaXrllW0tw',
        name: 'Support situational overview',
    },
    {
        id: 'surge_table/element29',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ev-opnr7uyVFgzk-h3lX9BgB8fHsBhqiukJDL_5KBX57bA?e=jpbj6G',
        name: 'Monitor Pledges, Donors Requirements, and Interest',
    },
    {
        id: 'surge_table/element1_14',
        url: 'https://smcctoolkit.org/tool-kit/#x-section-4',
        name: 'Produce Movement picture',
    },
    {
        id: 'surge_table/element26',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElJ7QaCcS2RCtxnRPHFb0W0B_C0tzKhGy8kjUsbENzs2Ww',
        name: 'Mobilization Table in Place & Modified as Operations Progresses',
    },
    {
        id: 'surge_table/element1_19',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErfZJPKdfjJIgI6DE9t0D6sB1XVEpNb-vGrrM7wlcOw1QA',
        name: 'Revise customs regulations',
    },
    {
        id: 'surge_table/element1_24',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpHQGrFvG2pPk-0cwLYIHTsBjoQH-e6WLwOBI50ODTjyuw',
        name: 'Develop Security plan',
    },
    {
        id: 'surge_table/element1_25',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpHQGrFvG2pPk-0cwLYIHTsBjoQH-e6WLwOBI50ODTjyuw',
        name: 'Develop Security plan',
    },
    {
        id: 'surge_table/element1_20',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ep-ZW8Nh_-FOi7Qo9FCOfxIBsTHJDpvW6k82Xz3fl4xtjQ',
        name: 'Create Fleet plan',
    },
    {
        id: 'surge_table/element1_22',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvI36WxaE2hMrh03KVK-RAkBAUHdwWKERLPjDaSmIRLbuw',
        name: 'Set Up Procurement Plan',
    },
    {
        id: 'surge_table/element1_23',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvI36WxaE2hMrh03KVK-RAkBAUHdwWKERLPjDaSmIRLbuw',
        name: 'Revise Procurement Plan',
    },
    {
        id: 'surge_table/element1_21',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Et5Cc35pRYpJtas4a3IBooABKh0m6JR7dHdfLXGkQpKHDQ?e=UY2R5w',
        name: 'Set up Fleet Plan - regional',
    },
    {
        id: 'surge_table/element1_26',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EiK1nlWLC35IpNWCcXZHDpIB5ZgD83UBhdgFIltmPkSVsw',
        name: 'Develop Medevac',
    },
    {
        id: 'surge_table/element1_27',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqNijq6LJgJMiRKSgYp5eocBORHiCWXUPr7-rCwLqzH6MA',
        name: 'Define Key Messages & Reactive Lines',
    },
    {
        id: 'surge_table/element1_28',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eq38joe3oBBFqPt6vz8Q3SkBlVdjHebEjOkJQIUQNKn-Ng',
        name: 'Develop Communications Plan & Strategy',
    },
    {
        id: 'surge_table/element1_29',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EiMzmHnXvBxJqWm17AdqMgEBEZFFH5-C1dLcx4bM1jlcGw',
        name: 'Create Environmental Impact Plan',
    },
    {
        id: 'surge_table/element1_18',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EnYRiFl7N-pErKxD-zRnFpIB07s7ezSEafHKQJNzaSbhFQ',
        name: 'Create logistics plan',
    },
    {
        id: 'surge_table/element1_30',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ehpgtwo3zXVOowJihJtw5EYBT5YeOYAwlJq22ZZnpxFG1Q',
        name: 'Establish Compliance Steps',
    },
    {
        id: 'surge_table/element2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ekit1U5FOdZHqTgBCJUrMrcBwZBI7B5616wXmd0qf48JvA?e=NEkWJa',
        name: 'Assessment',
    },
    {
        id: 'surge_table/element3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErZJCWqXHlZNl87Whkh4P8cBsPqnQiA2w8yLZ54WnsI_Gg?e=SAErla',
        name: 'Planning',
    },
    {
        id: 'surge_table/element4_6',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eu-2i53oWANAiylOkCJZEBcBXsC8YV9kZnIFV4hbBri4Sw?e=u7rgVj',
        name: 'Coordination',
    },
    {
        id: 'surge_table/element5_3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eha-owDva2JElW2WWREcydYB7-9z-8qdRMz49XuIWgrTYg?e=n55JKs',
        name: 'Surge and HR',
    },
    {
        id: 'surge_table/element6_3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EgEs6nIIHFpMgXEy2VKsw_QBtfHXTDzzQrjW042-aZPs8w?e=QiVTgv',
        name: 'Monitor and Eval',
    },
    {
        id: 'surge_table/element7_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EtASLO-V_pNBsApgmaAueNoBOhpbfdicPIlhtOrRMELkOQ?e=rLLOzq',
        name: 'IM',
    },
    {
        id: 'surge_table/element8_3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmJ0Y0zgKJJHjhYW0fnm_ZEBzhbzNAliAJiwM--4_nZ3rA?e=4LZCV0',
        name: 'Finance Admin',
    },
    {
        id: 'surge_table/element9_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoQ9fdVxdK9LkKH7ZIcMCOgBqAdqZoImtTTLFiTLE99uSw?e=APiGh7',
        name: 'Logistics',
    },
    {
        id: 'surge_table/element10_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElF8JM-Rq3tKre35oj_ztDIBImCNxctFo5tNt1SRCFpjdg?e=5ouvWw',
        name: 'safetyAndSecurity',
    },
    {
        id: 'surge_table/element10_3',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpFFWBTH9RtOsuQGGg0DXdAB0dbWQz484b1pFn1UDzpBIw?e=AnOF05',
        name: 'Communications',
    },
    {
        id: 'surge_table/element11_2',
        url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EunRRnfObqxFvy7UhvoJ1aMBwPBqAfrkzLNvBmuIccPdRg?e=i4tMhz',
        name: 'Other',
    },
];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const handleClick: MouseEventHandler<SVGElement> = (event) => {
        const clickedElement = (event.target as SVGElement).closest('[id^="surge_table/element"]');
        if (clickedElement) {
            const clickedContent = operationTimelineContent.find((value) => value.id === clickedElement.getAttribute('id'));
            if (clickedContent) {
                window.open(clickedContent.url, '_blank');
            }
        }
    };

    const handleHover: MouseEventHandler<SVGElement> = (event) => {
        const clickedElement = (event.target as SVGElement).closest('[id^="surge_table/element"]');
        if (clickedElement) {
            clickedElement.querySelectorAll('rect')?.forEach((e) => {
                e.style.fill = '#FEEFF0';
            });
            clickedElement.querySelectorAll('circle')?.forEach((e) => {
                e.style.fill = '#F5333F';
            });
        }
    };

    const handleMouseOut: MouseEventHandler<SVGElement> = (event) => {
        const clickedElement = (event.target as SVGElement).closest('[id^="surge_table/element"]');
        if (clickedElement) {
            clickedElement.querySelectorAll('rect')?.forEach((e) => {
                e.style.fill = '';
            });
            clickedElement.querySelectorAll('circle')?.forEach((e) => {
                e.style.fill = '';
            });
        }
    };

    const fundingCoverageDescription = resolveToComponent(
        strings.weAreLookingFor,
        {
            here: (
                <Link
                    href="https://ifrcorg.sharepoint.com/:x:/s/IFRCSharing/EZrYT-ysYfFFn9skPZxClN8B2sQPuY-GVvi3ddwdc5ZPHw"
                    external
                >
                    {strings.here}
                </Link>
            ),
            emailOne: (
                <Link
                    href="mailto:antoine.belair@ifrc.org"
                    external
                >
                    antoine.belair@ifrc.org
                </Link>
            ),
            emailTwo: (
                <Link
                    href="mailto:betisa.egea@ifrc.org"
                    external
                >
                    betisa.egea@ifrc.org
                </Link>
            ),
        },
    );

    const perSectionHeading = resolveToComponent(
        strings.perSectionHeading,
        {
            per: (
                <Link
                    href="https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EkiQndccd4ZIqMyUn983XiUBRfA14qW_CojCjibdG_Tmcw?e=My2KYE"
                    external
                >
                    {strings.per}
                </Link>
            ),
        },
    );

    const perSectionThree = resolveToComponent(
        strings.perSectionThree,
        {
            bottlenecks: (
                <Link
                    to="preparednessGlobalCatalogue"
                >
                    {strings.bottlenecks}
                </Link>
            ),
        },
    );

    const perSectionFive = resolveToComponent(
        strings.perSectionFive,
        {
            learnings: (
                <Link
                    to="operationalLearning"
                >
                    {strings.learnings}
                </Link>
            ),
            framework: (
                <Link
                    href="https://eur02.safelinks.protection.outlook.com/ap/w-59584e83/?url=https%3A%2F%2Fifrcorg.sharepoint.com%2F%3Aw%3A%2Fr%2Fsites%2FIFRCSharing%2F_layouts%2F15%2FDoc.aspx%3Fsourcedoc%3D%257B649265AA-DCEE-467D-99FC-EEA27C53B2B1%257D%26file%3D3.4%2520Discussion%2520points%2520for%2520DREF%2520operations%2520Lessons%2520Learnt%2520exercise.docx%26action%3Ddefault%26mobileredirect%3Dtrue&data=04%7C01%7CAnaMaria.ESCOBAR%40ifrc.org%7Ced517ec29d684796fe4908d99aefff43%7Ca2b53be5734e4e6cab0dd184f60fd917%7C0%7C0%7C637711177887192449%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=Qgqny5AAgYRT4jV5mrfSxXZENXUMO4ufXeexPr0Dkg8%3D&reserved=0"
                    external
                >
                    {strings.framework}
                </Link>
            ),
        },
    );

    const perSectionFooter = resolveToComponent(
        strings.perSectionFooter,
        {
            here: (
                <Link
                    href="https://www.ifrc.org/disaster-preparedness"
                    external
                >
                    {strings.here}
                </Link>
            ),
            information: (
                <Link
                    to="preparednessGlobalSummary"
                >
                    {strings.information}
                </Link>
            ),
            capacity: (
                <Link
                    to="preparednessGlobalPerformance"
                >
                    {strings.capacity}
                </Link>
            ),
            emailThree: (
                <Link
                    href="mailto:Marjorie.sotofranco@ifrc.org"
                    external
                >
                    Marjorie.sotofranco@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <Container
            headingLevel={2}
            heading={strings.surgeOperationalToolboxHeading}
            className={styles.surgeOperationalToolbox}
            headerDescription={strings.surgeOperationalToolboxHeadingDescription}
            childrenContainerClassName={styles.content}
            spacing="comfortable"
        >
            <ExpandableContainer
                heading={strings.operationalToolboxOverviewHeading}
                initiallyExpanded
            >
                <Container
                    heading={strings.overviewNavigationHowTo}
                    headingLevel={4}
                    contentViewType="vertical"
                    spacing="cozy"
                    headerDescription={strings.overviewSectionHeader}
                >
                    <TextOutput
                        value={strings.toolboxValue}
                        label={strings.toolboxLabel}
                        strongLabel
                    />
                    <TextOutput
                        value={strings.timelineValue}
                        label={strings.timelineLabel}
                        strongLabel
                    />
                    <div>{strings.overviewSectionFooter}</div>
                </Container>
            </ExpandableContainer>
            <div className={styles.svgContainer}>
                <OperationalTimelineTitle />
                <OperationalTimelineBody
                    onClick={handleClick}
                    onMouseOver={handleHover}
                    onMouseOut={handleMouseOut}
                />
            </div>
            <div className={styles.footer}>
                <div>{fundingCoverageDescription}</div>
                <div>{perSectionHeading}</div>
                <ul>
                    <li>{strings.perSectionOne}</li>
                    <li>{strings.perSectionTwo}</li>
                    <li>{perSectionThree}</li>
                    <li>{strings.perSectionFour}</li>
                    <li>{perSectionFive}</li>
                    <li>{strings.perSectionSix}</li>
                </ul>
                <div>{perSectionFooter}</div>
            </div>
        </Container>
    );
}

Component.displayName = 'SurgeOperationalToolbox';
