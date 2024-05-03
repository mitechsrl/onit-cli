import inquirer from 'inquirer';

/**
 * Quick function to prompt a confirm using inquirer
 * @param msg 
 * @returns 
 */
export async function confirm(msg: string): Promise<boolean> {
    const answers = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: msg
    }]);
    
    return answers.confirm;
}