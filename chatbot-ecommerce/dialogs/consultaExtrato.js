const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const axios = require('axios'); // Importa o axios

const WATERFALL_DIALOG = 'waterfallDialog';
const CPF_PROMPT = 'cpfPrompt';

class consultaExtrato extends ComponentDialog {
    constructor(id) {
        super(id);

        // Adicionar o TextPrompt para solicitar o CPF
        this.addDialog(new TextPrompt(CPF_PROMPT));

        // Configurar o WaterfallDialog com os novos passos
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptForCpfStep.bind(this),
            this.processCpfStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // Passo 1: Solicita o CPF ao usuário
    async promptForCpfStep(stepContext) {
        return await stepContext.prompt(CPF_PROMPT, {
            prompt: 'Por favor, informe o seu CPF para que eu possa buscar o seu extrato:'
        });
    }

    // Passo 2: Processa o CPF e chama a API
    async processCpfStep(stepContext) {
        const cpf = stepContext.result;

        try {
            // Faz a chamada à API usando o CPF fornecido
            const response = await axios.get(`https://apipedidosextratos.azurewebsites.net/ecommerce/extrato/buscar-por-cpf/${cpf}`);

            const extrato = response.data;

            if (extrato && extrato.length > 0) {
                let mensagem = '📄 **Aqui está o seu extrato:**\n\n';
                extrato.forEach(item => {
                    mensagem += `\n🔹 **CPF do Responsável:** ${item.cpf}\n`;
                    mensagem += `\n🆔 **ID da Compra:** ${item.id}\n`;
                    mensagem += `\n📦 **Produto:** ${item.productName}\n`;
                    mensagem += `\n💰 **Preço:** R$ ${item.price.toFixed(2)}\n`;
                    mensagem += `\n📅 **Data da Compra:** ${new Date(item.dataCompra).toLocaleString('pt-BR')}\n\n`;
                    mensagem += `---------------------------------\n`;
                });
                await stepContext.context.sendActivity(mensagem);
            } else {
                await stepContext.context.sendActivity('❌ Não foram encontrados registros para o CPF informado.');
            }
        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            await stepContext.context.sendActivity('Desculpe, ocorreu um erro ao obter o seu extrato.');
        }

        return await stepContext.next();
    }

    // Passo 3: Finaliza o diálogo
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais informações, é só perguntar!');
        return await stepContext.endDialog();
    }
}

module.exports.consultaExtrato = consultaExtrato;
