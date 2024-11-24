const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const axios = require('axios'); // Importa o axios

const WATERFALL_DIALOG = 'waterfallDialog';
const ID_PROMPT = 'idPrompt';

class consultaPedido extends ComponentDialog {
    constructor(id) {
        super(id);

        // Adicionar o TextPrompt para solicitar o ID do pedido
        this.addDialog(new TextPrompt(ID_PROMPT));

        // Configurar o WaterfallDialog com os novos passos
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptForIdStep.bind(this),
            this.processIdStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // Passo 1: Solicita o ID do pedido ao usuário
    async promptForIdStep(stepContext) {
        return await stepContext.prompt(ID_PROMPT, {
            prompt: 'Por favor, informe o ID do pedido para que eu possa buscar as informações:'
        });
    }

    // Passo 2: Processa o ID e chama a API
    async processIdStep(stepContext) {
        const pedidoId = stepContext.result;

        try {
            // Faz a chamada à API usando o ID do pedido fornecido
            const response = await axios.get(`https://apipedidosextratos.azurewebsites.net/ecommerce/extrato/buscar-por-id/${pedidoId}`);

            const pedido = response.data;


            if (pedido) {
                let mensagem = `Aqui estão as informações do pedido:\n\n`;
                mensagem += `\n📋 **Cpf do Responsável do Pedido:** ${pedido.cpf}\n`;
                mensagem += `\n🆔 **ID do Pedido:** ${pedido.id}\n`;
                mensagem += `\n📦 **Produto:** ${pedido.productName}\n`;
                mensagem += `\n💰 **Preço:** R$ ${pedido.price.toFixed(2)}\n`;
                mensagem += `\n📅 **Data da Compra:** ${new Date(pedido.dataCompra).toLocaleString('pt-BR')}\n\n`;
                await stepContext.context.sendActivity(mensagem);
            } else {
                await stepContext.context.sendActivity('❌ Não foi encontrado um pedido com o ID informado.');
            }
        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            await stepContext.context.sendActivity('Desculpe, ocorreu um erro ao obter as informações do pedido.');
        }

        return await stepContext.next();
    }

    // Passo 3: Finaliza o diálogo
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais informações, é só perguntar!');
        return await stepContext.endDialog();
    }
}

module.exports.consultaPedido = consultaPedido;
