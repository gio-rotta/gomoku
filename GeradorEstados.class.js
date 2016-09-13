
function GeradorEstados(tabuleiro, numeroCorte, verificador, grafo, index) {

	this._numeroCorte = numeroCorte;
	this._verificador = verificador;
	this._index = index;

	Grafo.prototype.buscaMinMaxComPoda = function(v, jogador, alpha, beta) {
  		var vertice = this._vertices[v];
  		if (Object.keys(vertice._emissor).length == 0) {
  			return { score: vertice._dados._valorAcumulado,
  						id: v};
  		}
  		if (jogador == 'computador') {
	  		for (var emitido in vertice._emissor){
				var result = this.buscaMinMaxComPoda(emitido, 'humano', alpha, beta)
				if (result.score > alpha.score) alpha = result;
  				if (alpha.score >= beta.score) break;  
			}
  			return alpha;
  		} else if (jogador != 'computador') {
	  		for (var emitido in vertice._emissor){
				var result = this.buscaMinMaxComPoda(emitido, 'computador', alpha, beta)
				if (result.score < beta.score) beta = result
  				if (alpha.score >= beta.score) break;
			}
  			return beta;
  		}
  	}

	/* Gerar um nível da árvore estado */
	this.gerarNovosEstados = function(indexInicial, estadoInicial, cor, indiceNivel) {

		var jogo = _.clone(estadoInicial);
		var tabuleiro = jogo._tabuleiro;

		var pontoCM = this.calculoCentroDeMassa(jogo);
		
		var fim = (Math.abs(pontoCM.linha - jogo.linhas) > Math.abs(pontoCM.coluna - jogo.colunas))? Math.abs(pontoCM.linha - jogo.linhas) : Math.abs(pontoCM.coluna - jogo.colunas);

		var vaziasCima = 0;
		var vaziasBaixo = 0;
		var vaziasEsquerda = 0;
		var vaziasDireita = 0;


		if (tabuleiro[pontoCM.linha][pontoCM.coluna] == 0) {
			if (tabuleiro[pontoCM.linha][pontoCM.coluna] == 0) {
				var novoEstado = this.criarEstado( pontoCM.linha, pontoCM.coluna, cor, jogo, this._verificador, indiceNivel);
				var adicionou = grafo.adicionaVertice(++this._index, novoEstado);
				if (adicionou) grafo.conecta(indexInicial, this._index);
			}
		}

		var contador = 1;
		//linha
		for (var i = 0; i < fim; i++) {
			var limiteCima = (pontoCM.linha - contador >= 0);
			var limiteBaixo = (pontoCM.linha + contador < jogo.linhas);
			var limiteEsquerda = (pontoCM.coluna - contador >= 0);
			var limiteDireita = (pontoCM.coluna + contador < jogo.colunas);

			var inicioDaLinha = (limiteEsquerda)? pontoCM.coluna - contador : 0;
			var fimDaLinha = (limiteDireita)? pontoCM.coluna + contador : jogo.colunas - 1;

			var linhaBaixo = (limiteBaixo)? pontoCM.linha + contador : jogo.linhas - 1;
			var linhaCima = (limiteCima)? pontoCM.linha - contador : 0;
			
			var linhaBaixo2 = (limiteBaixo)? pontoCM.linha + contador - 1 : jogo.linhas - 1;
			var linhaCima2 = (limiteCima)? pontoCM.linha - contador + 1 : 0;

			if ((!limiteDireita || vaziasDireita > numeroCorte) && (!limiteEsquerda || vaziasEsquerda > numeroCorte) && 
				(!limiteCima || vaziasCima > numeroCorte) && (!limiteBaixo || vaziasBaixo > numeroCorte)) {
				break;
			}

			// baixo
			if ( limiteBaixo && vaziasBaixo < numeroCorte) {
				var mudanca = 0
					for (var j = inicioDaLinha; j <= fimDaLinha; j++) {
						if (tabuleiro[linhaBaixo][j] == 0) {
							var novoEstado = this.criarEstado( linhaBaixo, j, cor, jogo,  this._verificador, indiceNivel);
							var adicionou = grafo.adicionaVertice(++this._index, novoEstado);
							if (adicionou) grafo.conecta(indexInicial, this._index);
						} else {
							mudanca++;
						}
					}
				vaziasBaixo = (mudanca == 0)? vaziasBaixo + 1 : 0;
			}

			// cima
			if ( limiteCima && vaziasCima < numeroCorte) {
				var mudanca = 0
				for (var j = inicioDaLinha; j <= fimDaLinha; j++) {
					if (tabuleiro[linhaCima][j] == 0) {
						var novoEstado = this.criarEstado( linhaCima, j, cor, jogo,  this._verificador, indiceNivel);
						var adicionou = grafo.adicionaVertice(++this._index, novoEstado);
						if (adicionou) grafo.conecta(indexInicial, this._index);
					} else {
						mudanca++;
					}
				
				}
				vaziasCima = (mudanca == 0)? vaziasCima + 1 : 0;
			}

			// esquerda
			if ( limiteEsquerda && vaziasEsquerda < numeroCorte) {
				var mudanca = 0
				for (var j = linhaCima2; j <= linhaBaixo2; j++) {
					if (tabuleiro[j][inicioDaLinha] == 0) {
						var novoEstado = this.criarEstado( j, inicioDaLinha, cor, jogo,  this._verificador, indiceNivel);
						var adicionou = grafo.adicionaVertice(++this._index, novoEstado);
						if (adicionou) grafo.conecta(indexInicial, this._index);
					} else {
						mudanca++;
					}
				}
				vaziasEsquerda = (mudanca == 0)? vaziasEsquerda + 1 : 0;
			}

			// direita
			if ( limiteDireita && vaziasDireita < numeroCorte) {
				var mudanca = 0
				for (var j = linhaCima2; j <= linhaBaixo2; j++) {
					if (tabuleiro[j][fimDaLinha] == 0) {
						var novoEstado = this.criarEstado( j, fimDaLinha, cor, jogo,  this._verificador, indiceNivel);
						var adicionou = grafo.adicionaVertice(++this._index, novoEstado);
						if (adicionou) grafo.conecta(indexInicial, this._index);
					} else {
							mudanca++;
					}
				}
				vaziasDireita = (mudanca == 0)? vaziasDireita + 1 : 0;
			}
			contador++;  
		}
	}

	this.criarEstado = function(linha, coluna, cor, tabuleiro, verificador, indiceNivel) {
		var novoEstado = JSON.parse(JSON.stringify(tabuleiro)); 
		novoEstado.adicionarPeca = tabuleiro.adicionarPeca;
		var valorJogada = this._verificador.verificarJogada(novoEstado, {linha: linha, coluna: coluna, cor: cor}, indiceNivel);
		novoEstado._valorAcumulado += valorJogada;
		novoEstado.adicionarPeca(cor, linha, coluna);
		return novoEstado;
	}

	this.calculoCentroDeMassa = function(tabuleiro) {
		var somatorioX = 0;
		var somatorioY = 0;

		tabuleiro._brancas.forEach( function(peca) {
			somatorioX += peca.linha;
			somatorioY += peca.coluna;
		});

		tabuleiro._pretas.forEach( function(peca) {
			somatorioX += peca.linha;
			somatorioY += peca.coluna;
		});

		return {
			linha: Math.round(somatorioX/(tabuleiro._pretas.length + tabuleiro._brancas.length)),
			coluna: Math.round(somatorioY/(tabuleiro._pretas.length + tabuleiro._brancas.length))
		}
	}
}