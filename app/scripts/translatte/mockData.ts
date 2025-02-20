import {
    MigrationFileContent,
    TranslationFileContent,
    SourceFileContent,
} from './types';

export const migrationContent1: MigrationFileContent = {
    "actions": [
        {
            "action": "add",
            "namespace": "login",
            "key": "emailLabel",
            "value": "Email/Username*"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "emailPlaceholder",
            "value": "Email/Username*"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "passwordLabel",
            "value": "Password*"
        },
        {
            "action": "add",
            "namespace": "login",
            "key": "loginButton",
            "value": "Login"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "firstNameLabel",
            "value": "First Name*"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "lastNameLabel",
            "value": "Last Name*"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "emailLabel",
            "value": "Email*"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "passwordLabel",
            "value": "Password*"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "confirmPasswordLabel",
            "value": "Confirm Password*"
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "signUpButton",
            "value": "Sign Up"
        },
        {
            "action": "add",
            "namespace": "home",
            "key": "header",
            "value": "IFRC Disaster Response and Preparedness"
        },
        {
            "action": "add",
            "namespace": "home",
            "key": "subHeader",
            "value": "IFRC GO aims to make all disaster information universally accessible and useful to IFRC responders for better decision making."
        }
    ],
};
// Story: using the migration file below
// 1. we need to remove the asterisks from all the labels
// 2. we need to use register consistenlty, so use "Register" instead of "Sign Up"
export const migrationContent2: MigrationFileContent = {
    "parent": "000001-1000000000000",
    "actions": [
        {
            "action": "update",
            "namespace": "login",
            "key": "emailLabel",
            "newValue": "Email/Username"
        },
        {
            "action": "update",
            "namespace": "login",
            "key": "passwordLabel",
            "newValue": "Password"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "firstNameLabel",
            "newValue": "First Name"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "lastNameLabel",
            "newValue": "Last Name"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "emailLabel",
            "newValue": "Email"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "passwordLabel",
            "newValue": "Password"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "confirmPasswordLabel",
            "newValue": "Confirm Password"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "signUpButton",
            "newValue": "Register"
        }
    ],
};
// Story: using the migration file below
// 1. we need to add header for login and register page
export const migrationContent3: MigrationFileContent = {
    "parent": "000002-1000000000000",
    "actions": [
        {
            "action": "add",
            "namespace": "login",
            "key": "header",
            "value": "Staff, members and volunteers of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) are welcome to register for a user account on GO, to access information for the Membership. Other responders and members of the public may browse the public areas of the site without registering for an account."
        },
        {
            "action": "add",
            "namespace": "register",
            "key": "header",
            "value": "If you are staff, member or volunteer of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) login with you email and password."
        }
    ],
};
// Story: using the migration file below
// 1. we need to fix the header text for login and register page. They have been mistakenly swapped
// 2. we need to use "register" consistently, even on keys.
export const migrationContent4: MigrationFileContent = {
    "parent": "000003-1000000000000",
    "actions": [
        {
            "action": "update",
            "namespace": "login",
            "key": "header",
            "newNamespace": "register"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "header",
            "newNamespace": "login"
        },
        {
            "action": "update",
            "namespace": "register",
            "key": "signUpButton",
            "newKey": "registerButton"
        }
    ],
};
// Story: using the migration file below
// 1. we need to delete unused strings for home page
// 2. we need to delete unused strings for register page
export const migrationContent5: MigrationFileContent = {
    "parent": "000004-1000000000000",
    "actions": [
        {
            "action": "remove",
            "namespace": "home",
            "key": "header"
        },
        {
            "action": "remove",
            "namespace": "home",
            "key": "subHeader"
        },
        {
            "action": "remove",
            "namespace": "register",
            "key": "header"
        }
    ]
};

// Story: we now have 2 translations files after applying the above migrations
export const loginContent = {
    namespace: 'login',
    strings: {
        emailLabel: 'Email/Username',
        emailPlaceholder: 'Email/Username*',
        passwordLabel: 'Password',
        loginButton: 'Login',
        header: 'If you are staff, member or volunteer of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) login with you email and password.',
    },
} satisfies TranslationFileContent;
export const registerContent = {
    namespace: 'register',
    strings: {
        firstNameLabel: 'First Name',
        lastNameLabel: 'Last Name',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        confirmPasswordLabel: 'Confirm Password',
        registerButton: 'Register',
    },
} satisfies TranslationFileContent;

// Story: if the server has no translation data and we push the
// above migrations, we get the following strings in server
export const strings1: SourceFileContent = {
    strings: [
        {
            hash: 'c1e1b9ea3f9cfc3eb3e7b8804139ed00',
            key: 'emailLabel',
            page_name: 'login',
            language: 'en',
            value: 'Email/Username',
        },
        {
            hash: 'c1e1b9ea3f9cfc3eb3e7b8804139ed00',
            key: 'emailLabel',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '7257816a20f2dda660c44809235ea44a',
            key: 'emailPlaceholder',
            language: 'en',
            page_name: 'login',
            value: 'Email/Username*',
        },
        {
           hash: '7257816a20f2dda660c44809235ea44a',
           key: 'emailPlaceholder',
           language: 'np',
           page_name: 'login',
           value: '',
        },
        {
            hash: 'd7d3cc6191dfa630aaa8bcf8d83d8a71',
            key: 'header',
            page_name: 'login',
            language: 'en',
            value: 'If you are staff, member or volunteer of the Red Cross Red Crescent Movement (National Societies, the IFRC and the ICRC) login with you email and password.',
        },
        {
            hash: 'd7d3cc6191dfa630aaa8bcf8d83d8a71',
            key: 'header',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '99dea78007133396a7b8ed70578ac6ae',
            key: 'loginButton',
            page_name: 'login',
            language: 'en',
            value: 'Login',
        },
        {
            hash: '99dea78007133396a7b8ed70578ac6ae',
            key: 'loginButton',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'login',
            language: 'en',
            value: 'Password',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '887f7db126221fe60d18c895d41dc8f6',
            key: 'confirmPasswordLabel',
            page_name: 'register',
            language: 'en',
            value: 'Confirm Password',
        },
        {
            hash: '887f7db126221fe60d18c895d41dc8f6',
            key: 'confirmPasswordLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: 'ce8ae9da5b7cd6c3df2929543a9af92d',
            key: 'emailLabel',
            page_name: 'register',
            language: 'en',
            value: 'Email',
        },
        {
            hash: 'ce8ae9da5b7cd6c3df2929543a9af92d',
            key: 'emailLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: 'bc910f8bdf70f29374f496f05be0330c',
            key: 'firstNameLabel',
            page_name: 'register',
            language: 'en',
            value: 'First Name',
        },
        {
            hash: 'bc910f8bdf70f29374f496f05be0330c',
            key: 'firstNameLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: '77587239bf4c54ea493c7033e1dbf636',
            key: 'lastNameLabel',
            page_name: 'register',
            language: 'en',
            value: 'Last Name',
        },
        {
            hash: '77587239bf4c54ea493c7033e1dbf636',
            key: 'lastNameLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'register',
            language: 'en',
            value: 'Password',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: '0ba7583639a274c434bbe6ef797115a4',
            key: 'registerButton',
            page_name: 'register',
            language: 'en',
            value: 'Register',
        },
        {
            hash: '0ba7583639a274c434bbe6ef797115a4',
            key: 'registerButton',
            page_name: 'register',
            language: 'np',
            value: '',
        },
    ],
    last_migration: '000005-1000000000000.json',
};

// Story: code has been updated as presented below by the developers
export const updatedLoginContent: TranslationFileContent = {
    ...loginContent,
    strings: {
        ...loginContent.strings,
    }
};
export const updatedRegisterContent: TranslationFileContent = {
    ...registerContent,
    strings: {
        ...registerContent.strings,
    }
};
// Delete
delete updatedLoginContent.strings.header;
// Add
updatedLoginContent.strings.footer = 'All rights reserved.';
// Update key
updatedLoginContent.strings.loginBtn = updatedLoginContent.strings.loginButton;
delete updatedLoginContent.strings.loginButton;
// Update content
updatedLoginContent.strings.emailLabel = 'Email';
// Delete
delete updatedRegisterContent.strings.confirmPasswordLabel;
// Add
updatedRegisterContent.strings.backLink = 'Back to login';
// Update key
updatedRegisterContent.strings.registerBtn = updatedRegisterContent.strings.registerButton;
delete updatedRegisterContent.strings.registerButton;
// Update content
updatedRegisterContent.strings.emailLabel = 'Email or Username';
// Update namespace
delete updatedRegisterContent.strings.firstNameLabel;
updatedLoginContent.strings.firstNameLabel = 'First Name';
delete updatedRegisterContent.strings.lastNameLabel;
updatedLoginContent.strings.lastNameLabel = 'Last Name';

// Story: we can get the following migration file after generating
// migration comparing the code with previous migrations
export const migrationContent6: MigrationFileContent = {
    parent: '000005-1000000000000.json',
    actions: [
        {
            action: 'add',
            key: 'footer',
            namespace: 'login',
            value: 'All rights reserved.',
        },
        {
            action: 'remove',
            key: 'header',
            namespace: 'login',
        },
        {
            action: 'update',
            key: 'emailLabel',
            namespace: 'login',
            newValue: 'Email',
        },
        {
            action: 'update',
            key: 'loginButton',
            namespace: 'login',
            newKey: 'loginBtn',
        },
        {
            action: 'add',
            key: 'backLink',
            namespace: 'register',
            value: 'Back to login',
        },
        {
            action: 'remove',
            key: 'confirmPasswordLabel',
            namespace: 'register',
        },
        {
            action: 'update',
            key: 'emailLabel',
            namespace: 'register',
            newValue: 'Email or Username',
        },
        {
            action: 'update',
            key: 'firstNameLabel',
            namespace: 'register',
            newNamespace: 'login',
        },
        {
            action: 'update',
            key: 'lastNameLabel',
            namespace: 'register',
            newNamespace: 'login',
        },
        {
            action: 'update',
            key: 'registerButton',
            namespace: 'register',
            newKey: 'registerBtn',
        },
    ],
}

// Story: if we push new migration above, we get the following strings in server
export const strings2: SourceFileContent = {
    strings: [
        {
            hash: 'ce8ae9da5b7cd6c3df2929543a9af92d',
            key: 'emailLabel',
            page_name: 'login',
            language: 'en',
            value: 'Email',
        },
        {
            hash: 'c1e1b9ea3f9cfc3eb3e7b8804139ed00',
            key: 'emailLabel',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '7257816a20f2dda660c44809235ea44a',
            key: 'emailPlaceholder',
            language: 'en',
            page_name: 'login',
            value: 'Email/Username*',
        },
        {
           hash: '7257816a20f2dda660c44809235ea44a',
           key: 'emailPlaceholder',
           language: 'np',
           page_name: 'login',
           value: '',
        },
        {
            hash: 'bc910f8bdf70f29374f496f05be0330c',
            key: 'firstNameLabel',
            page_name: 'login',
            language: 'en',
            value: 'First Name',
        },
        {
            hash: 'bc910f8bdf70f29374f496f05be0330c',
            key: 'firstNameLabel',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '1efc109bdddbb6e51e9b69cc0a1b0701',
            key: 'footer',
            page_name: 'login',
            language: 'en',
            value: 'All rights reserved.',
        },
        {
            hash: '1efc109bdddbb6e51e9b69cc0a1b0701',
            key: 'footer',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '77587239bf4c54ea493c7033e1dbf636',
            key: 'lastNameLabel',
            page_name: 'login',
            language: 'en',
            value: 'Last Name',
        },
        {
            hash: '77587239bf4c54ea493c7033e1dbf636',
            key: 'lastNameLabel',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '99dea78007133396a7b8ed70578ac6ae',
            key: 'loginBtn',
            page_name: 'login',
            language: 'en',
            value: 'Login',
        },
        {
            hash: '99dea78007133396a7b8ed70578ac6ae',
            key: 'loginBtn',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'login',
            language: 'en',
            value: 'Password',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'login',
            language: 'np',
            value: '',
        },
        {
            hash: '463e58c1d35fb5a4a8d717c99a60d257',
            key: 'backLink',
            page_name: 'register',
            language: 'en',
            value: 'Back to login',
        },
        {
            hash: '463e58c1d35fb5a4a8d717c99a60d257',
            key: 'backLink',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: 'b7a9ca78ae5ec6f8c6af39f000b07da9',
            key: 'emailLabel',
            page_name: 'register',
            language: 'en',
            value: 'Email or Username',
        },
        {
            hash: 'ce8ae9da5b7cd6c3df2929543a9af92d',
            key: 'emailLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'register',
            language: 'en',
            value: 'Password',
        },
        {
            hash: 'dc647eb65e6711e155375218212b3964',
            key: 'passwordLabel',
            page_name: 'register',
            language: 'np',
            value: '',
        },
        {
            hash: '0ba7583639a274c434bbe6ef797115a4',
            key: 'registerBtn',
            page_name: 'register',
            language: 'en',
            value: 'Register',
        },
        {
            hash: '0ba7583639a274c434bbe6ef797115a4',
            key: 'registerBtn',
            page_name: 'register',
            language: 'np',
            value: '',
        },
    ],
    last_migration: '000006-1000000000000.json',
};
