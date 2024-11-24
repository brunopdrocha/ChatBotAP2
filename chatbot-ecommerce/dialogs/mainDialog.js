const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt, ChoiceFactory, DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { consultaExtrato } = require('./consultaExtrato');
const { consultaPedido } = require('./consultaPedido');
const { consultaProduto } = require('./consultaProduto');


const WATERFALL_DIALOG = 'waterfallDialog';
const CHOICE_PROMPT = 'choicePrompt';
let welcomeDialogCheck = false

class MainDialog extends ComponentDialog {
    constructor(id, userState) {
        super(id);

        this.userState = userState;

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        // Adiciona o diálogo consultaPedido ao conjunto de diálogos
        this.addDialog(new consultaPedido('consultaPedido'));
        this.addDialog(new consultaExtrato('consultaExtrato'));
        this.addDialog(new consultaProduto('consultaProduto'));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.choiceCardStep.bind(this),
            this.processChoiceStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        // Checks welcome Info Dialog
        if (welcomeDialogCheck === false){
            welcomeDialogCheck = true
            await turnContext.sendActivity(
                'Olá, tudo bem? Sou um assistente virtual do Trabalho do Joao Vitor Araujor, Mateus Norcia e Bruno Pilão e estou aqui para ajudar você. Qualquer dúvida, estou à disposição.'
            );
        }

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * 1. Prompts the user if the user is not in the middle of a dialog.
     * 2. Re-prompts the user when an invalid input is received.
     * @param {WaterfallStepContext} stepContext
     */
    async choiceCardStep(stepContext) {
        console.log('MainDialog.choiceCardStep'); // Log para depuração

        // Configurações do ChoicePrompt
        const options = {
            prompt: 'Escolha a opção desejada:',
            retryPrompt: 'Opção inválida. Por favor, selecione uma das opções disponíveis:',
            choices: this.getChoices()
        };

        // Prompt ao usuário com as opções configuradas
        return await stepContext.prompt(CHOICE_PROMPT, options);
    }

    // Processa a escolha do usuário
    async processChoiceStep(stepContext) {
        const choice = stepContext.result.value;

        // Resposta dinâmica baseada na escolha
        let responseMessage;
        switch (choice) {
            case 'Consulta Pedidos':
                return await stepContext.beginDialog('consultaPedido');
            case 'Consulta Extrato':
                return await stepContext.beginDialog('consultaExtrato');
            case 'Consulta Produto':
                return await stepContext.beginDialog('consultaProduto');
            default:
                responseMessage = 'Opção não reconhecida.';
        }

        await stepContext.context.sendActivity(responseMessage);

        // Finaliza o diálogo
        return await stepContext.endDialog();
    }

    // Configurações das opções do ChoicePrompt
    getChoices() {
        return [
            { value: 'Consulta Pedidos', synonyms: ['pedidos', 'primeira opção', 'pedido'] },
            { value: 'Consulta Extrato', synonyms: ['extrato', 'segunda opção','extrato'] },
            { value: 'Consulta Produto', synonyms: ['produto', 'terceira opção', 'produtos'] }
        ];
    }
}

module.exports.MainDialog = MainDialog;
