const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const WATERFALL_DIALOG = 'waterfallDialog';

class consultaProduto extends ComponentDialog {
    constructor(id) {
        super(id);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.showOrdersStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async showOrdersStep(stepContext) {
        await stepContext.context.sendActivity('Aqui estão os seus pedidos recentes:');
        await stepContext.context.sendActivity('- Pedido 1: Laptop - Enviado');
        await stepContext.context.sendActivity('- Pedido 2: Smartphone - Em Processamento');

        return await stepContext.next();
    }
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais informações, é só perguntar!');
        return await stepContext.endDialog();
    }
}

module.exports.consultaProduto = consultaProduto;
