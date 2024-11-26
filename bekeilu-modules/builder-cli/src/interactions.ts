import inquirer from 'inquirer'

export const shouldOverrideDir = async function (dirName) {
    const answers = await inquirer.prompt<{ shouldOverride: boolean }>([
        {
            name: 'shouldOverride',
            type: 'confirm',
            message: `Directory "${dirName}" already exists. Override it?`,
            default: false,
        },
    ])
    return answers['shouldOverride']
}
