
function Tabuleiro(colunas, linhas) {
	this.colunas = colunas;
	this.linhas = linhas;
	this._brancas = [];
	this._nBrancas = 0;
	this._pretas = [] ;
	this._nPretas = 0;
	this._ultimaBranca = null;
	this._ultimaPreta = null;
	this._tabuleiro = [];
	this._valorAcumulado = 0;

	this.novoTabuleiro = function() {
		for (var i = 0; i < this.linhas; i++) {
			var linha = []
			for (var j = 0; j < this.colunas; j++) {
				linha.push(0)
			}
			this._tabuleiro.push(linha)
		}	
	}

	this.adicionarPeca = function(cor, linha, coluna) {
		if (this._tabuleiro[linha][coluna] != 0) {
		} else {
			this._tabuleiro[linha][coluna] = cor;
			// this._ultimaPeca = {linha: linha, coluna: coluna, cor: cor}; 
			if (cor == 1) {
				this._brancas.push({linha: linha, coluna: coluna})
				this._ultimaBranca = {linha: linha, coluna: coluna};
				this._nBrancas++;
			} else {
				this._pretas.push({linha: linha, coluna: coluna})
				this._ultimaPreta = {linha: linha, coluna: coluna};
				this._nPretas++;
			}
		}
	}
	
}