const axios = require('axios');

class CurrencyService {
    constructor() {
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
    }

    async fetchRates(baseCurrency = 'HNL') {
        try {
            const response = await axios.get(`${this.baseUrl}${baseCurrency}`);
            return response.data.rates;
        } catch (error) {
            throw new Error(`Error obteniendo tasas de cambio: ${error.message}`);
        }
    }

    async convert(amount, fromCurrency, toCurrency) {
        try {
            const rates = await this.fetchRates(fromCurrency);
            if (!rates[toCurrency]) {
                throw new Error(`Moneda ${toCurrency} no encontrada`);
            }
            return amount * rates[toCurrency];
        } catch (error) {
            throw new Error(`Error convirtiendo moneda: ${error.message}`);
        }
    }

    async getAvailableCurrencies() {
        try {
            const rates = await this.fetchRates();
            return Object.keys(rates);
        } catch (error) {
            throw new Error(`Error obteniendo monedas disponibles: ${error.message}`);
        }
    }

    async convertVehiclePrice(price, baseCurrency = 'HNL', targetCurrencies = ['EUR', 'USD']) {
        try {
            const rates = await this.fetchRates(baseCurrency);
            const conversions = {};
            for (const currency of targetCurrencies) {
                if (!rates[currency]) {
                    throw new Error(`Moneda ${currency} no encontrada`);
                }
                conversions[currency] = price * rates[currency];
            }
            return conversions;
        } catch (error) {
            throw new Error(`Error convirtiendo precio del vehículo: ${error.message}`);
        }
    }
}

const currencyService = new CurrencyService();

module.exports = currencyService;
