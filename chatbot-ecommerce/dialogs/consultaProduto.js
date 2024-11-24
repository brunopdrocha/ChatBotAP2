const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const axios = require('axios'); // Importa o axios

const WATERFALL_DIALOG = 'waterfallDialog';

class consultaProduto extends ComponentDialog {
    constructor(id) {
        super(id);

        // Configurar o WaterfallDialog com os passos
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.fetchAllProductsStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // Passo 1: Busca todos os produtos da API
    async fetchAllProductsStep(stepContext) {
        try {
            // Faz a chamada à API para buscar todos os produtos
            const response = await axios.get(`https://api-produtos.azurewebsites.net/ecommerce/products/produtos`);

            const produtos = response.data;

            if (produtos && produtos.length > 0) {
                let mensagem = '📦 **Lista de Produtos Disponíveis:**\n\n';
                produtos.forEach(produto => {
                    mensagem += `\n🆔 **ID do Produto:** ${produto.productid}\n`;
                    mensagem += `\n📂 **Categoria:** ${produto.productCategory}\n`;
                    mensagem += `\n📦 **Nome do Produto:** ${produto.productName}\n`;
                    mensagem += `\n💰 **Preço:** R$ ${produto.price.toFixed(2)}\n`;
                    mensagem += `---------------------------------\n`;
                });
                await stepContext.context.sendActivity(mensagem);
            } else {
                await stepContext.context.sendActivity('❌ Não foram encontrados produtos disponíveis no momento.');
            }
        } catch (error) {
            console.error('Erro ao chamar a API:', error);
            await stepContext.context.sendActivity('Desculpe, ocorreu um erro ao obter a lista de produtos.');
        }

        return await stepContext.next();
    }

    // Passo 2: Finaliza o diálogo
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Se precisar de mais informações, é só perguntar!');
        return await stepContext.endDialog();
    }
}

module.exports.consultaProduto = consultaProduto;
