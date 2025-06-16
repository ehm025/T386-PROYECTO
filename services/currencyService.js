const https = require('https');

class CurrencyService {
    constructor() {
        this.apiKey = '';
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
    }

    async fetchRates(baseCurrency = this.baseCurrency) {
        throw new Error("Not implemented");
    }

    async convert(amount, fromCurrency, toCurrency) {
        throw new Error("Not implemented");
    }

    async getAvailableCurrencies() {
        throw new Error("Not Implemented")
    }

    async convertVehiclePrice(price, baseCurrency = 'USD', targetCurrencies = ['EUR', 'GBP', 'JPY']) {
        throw new Error("Not Implemented")
    }
}

const currencyService = new CurrencyService();

module.exports = currencyService;
