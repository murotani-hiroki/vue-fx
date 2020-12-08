/*
const trades = [
    { id: 1, entryDate: '20200501',  exitDate: '20200501', pair: 'USD/JPY', type: 'bid', amount: 10000, entry: 105.20, exit:105.30, stoploss:10, profit: -1000 },
    { id: 2, entryDate: '20200502',  exitDate: '20200502', pair: 'EUR/JPY', type: 'ask', amount: 10000, entry: 115.50, exit:115.70, stoploss:5, profit: 2000 },
    { id: 3, entryDate: '20200503',  exitDate: '20200503', pair: 'EUR/JPY', type: 'bid', amount: 10000, entry: 115.10, exit:115.60, stoploss:10, profit: 5000 },
    { id: 4, entryDate: '20200503',  exitDate: '20200503', pair: 'AUD/USD', type: 'ask', amount: 10000, entry: 120.00, exit:120.20, stoploss:20, profit: 2000 },
    { id: 5, entryDate: '20200503',  exitDate: '20200503', pair: 'EUR/JPY', type: 'bid', amount: 10000, entry: 117.50, exit:118.00, stoploss:10, profit: 5000 },
]
*/
const store = new Vuex.Store({
    state: {
        /*
        trades: [
            { id: 1, entryDate: '20200501',  exitDate: '20200501', pair: 'USD/JPY', type: 'bid', amount: 10000, entry: 105.20, exit:105.30, stoploss:10, profit: -1000 },
            { id: 2, entryDate: '20200502',  exitDate: '20200502', pair: 'EUR/JPY', type: 'ask', amount: 10000, entry: 115.50, exit:115.70, stoploss:5, profit: 2000 },
        ],
        currentId: 2,
        */
        trades : [],
        currentId : 0,
        currencies: [
            'USD/JPY', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'NZD/JPY', 'CAD/JPY', 'ZAR/JPY', 'TRY/JPY', 'CHN/JPY', 'EUR/USD', 'GBP/USD', 'AUD/USD'
        ]
    },
    mutations: {
        // mutationの 第一引数： sate   第二引数： payload （ store.commitで指定した第二引数 )
        //save(state, { pair, type, amount }) {
        save(state, trade) {
            if (trade.id) {
                const i = state.trades.findIndex(e => e.id === trade.id)
                state.trades.splice(i, 1, trade)
            } else {
                trade.id = ++state.currentId
                state.trades.push(trade)
            }
            this.dispatch('save')
        },
        deleteTrades(state, deleteIds) {
            let notDeleted = state.trades.filter(trade => !deleteIds.includes(trade.id))
            state.trades.splice(0)
            notDeleted.forEach(trade => state.trades.push(trade))
            this.dispatch('save')
        },
        load(state, data) {
            //state.trades = data.trades
            /*
            const chartImage = new ChartImage('./upload' ,1);
            chartImage.loadImages().then(function() {
                console.log(chartImage.getImages());
            });
            */
            state.trades.splice(0)
            data.trades.forEach(
                e => {
                    //chartImage.loadImages().then(function() {
                    //    console.log(chartImage.getImages());
                    //});
                    state.trades.push(e)
                }
            )
            if (state.trades.length) {
                state.currentId = data.currentId 
            }
        }
    },
    actions: {
        // actionsの引数: コンテキストオブジェクト（ state, getters, dispatchメソッド, commitメソッド ）
        save(ctx) {
            const data = {
                trades: ctx.state.trades,
                currentId: ctx.state.currentId
            }
            localStorage.setItem('mrtnfx-data', JSON.stringify(data))
        },
        load(ctx) {
            const json = localStorage.getItem('mrtnfx-data')
            const data = JSON.parse(json)
            ctx.commit('load', data)
        }
    }
})

const ModalWindow = Vue.extend({
    data: function() {
        return {
            modalVisible: false,
            trade: {},
            currencies: store.state.currencies,
            imageFile: null,
            imageFiles: []
        }
    }, 
    methods: {
        modalOpen: function(trade) {
            this.trade = trade
            this.imageFile = null
            this.imageFiles = trade.imageFiles || []
            this.modalVisible = true
        },
        modalClose: function() {
            this.modalVisible = false
            this.$emit('modal-close')
        },
        save() {
            this.trade.imageFiles = this.imageFiles
            store.commit('save', this.trade)
        },
        addImage() {
            this.imageFiles.push(this.imageFile)
        },
        deleteImage(imageFile) {
            this.imageFiles = this.imageFiles.filter(i => i !== imageFile)
        },
    },
    template: '#modal'
})



new Vue({
    el: '#main', store,
    data: {
        range: {from: null, to: null},
        trades: [],
        selectedTrades: [],
        allSelected: false,
        tradeDefault: {
            amount: 10000
        }
        //modalVisible: false
    },
    /*
    computed: {
        isModalVisible : function() {
            return this.modalVisible
        }
    },
    */
    computed: {
        totalYen() {
            return this.trades.filter(trade => trade.pair.endsWith('JPY'))
                                .reduce((sum, i) => sum + parseInt(i.profit | 0), 0);
        },
        totalDollar() {
            const total = this.trades.filter(trade => trade.pair.endsWith('USD'))
                                .reduce((sum, i) => sum + parseFloat(isNaN(i.profit) ? 0 : i.profit), 0);
            return Math.round(total * 100) / 100;
        }
    },
    methods: {
        modalOpen: function(e) {
            const selectedTrade = this.trades.filter(trade => trade.id == e.target.text).pop();
            const copy = Object.assign({}, selectedTrade);
            this.$refs.modal.modalOpen(copy);
        },
        /*
        modalClose: function() {
            this.modalVisible = false
        }
        */
        modalOpenNew: function() {
            const copy = Object.assign({}, this.tradeDefault);
            this.$refs.modal.modalOpen(copy);
        },
        deleteTrades() {
            store.commit('deleteTrades', this.selectedTrades)
        },
        selectAll() {
            this.allSelected = !this.allSelected
            this.selectedTrades.splice(0)
            if (this.allSelected) {
                this.trades.forEach(trade => this.selectedTrades.push(trade.id))
            }
            console.log(this.selectedTrades)
            console.log(this.allSelected)
        },
        load() {
            store.dispatch('load')
            this.trades = store.state.trades
            this.search()
        },
        defaultRange() {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            this.range.from = this.yyyymmdd(startOfMonth);
            this.range.to = this.yyyymmdd(endOfMonth);
        },
        yyyymmdd(date) {
            return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        },
        search() {
            const from = this.range.from || '00000000'
            const to = this.range.to || '99999999'
            this.trades = this.trades.filter(trade => trade.entryDate >= from && trade.entryDate <= to)
        }
    },
    components: {
        'modal-window': ModalWindow
    },
    created: function() {
        this.defaultRange()
        this.load()
    }
})



