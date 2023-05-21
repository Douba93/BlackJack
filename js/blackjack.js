class Deck {
    constructor() {
        // C=trèfle D=careau H=coeur S=pique
        this.deck = [
            "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AC",
            "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD",
            "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AH",
            "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AS"
        ];
    }

    shuffle() {
        this.deck = this.deck.sort(() => Math.random() - 0.5);
    }

    dealCard() {
        if (this.deck.length > 15) {
            this.deck = [
                "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AC",
                "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD",
                "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AH",
                "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AS"
            ];
            this.shuffle();
        }
        return this.deck.pop();
    }
}

class Player {
    constructor() {
        this.hand = []; // Main du joueur, initialisée comme une liste vide
        this.wallet = 500;
    }

    bet(dols) {
        this.wallet = this.wallet - dols;
    }

    drawCard(card) {
        this.hand.push(card); // Ajoute la carte à la main du joueur
    }

    calculateScore() {
        let score = 0;
        let hasAce = false;

        for (let card of this.hand) {
            const rank = card.slice(0, -1); // Récupère le rang de la carte (par exemple, "2", "3", "10", "A")

            if (rank === "A") {
                score += 11; // Les As valent initialement 11 points
                hasAce = true;
            } else if (["K", "Q", "J"].includes(rank)) {
                score += 10; // Les cartes avec un rang de "K", "Q" ou "J" valent 10 points
            } else {
                score += parseInt(rank); // Les autres cartes valent leur rang en tant que points
            }
        }

        // Gère le cas où l'As est compté comme 11 mais dépasse 21 points
        if (hasAce && score > 21) {
            score -= 10; // L'As est réduit à 1 point
        }

        return score;
    }
}

class Bank {
    constructor() {
        this.hand = [];
    }

    drawCard(card) {
        this.hand.push(card);
    }

    calculateScore() {
        let score = 0;
        let hasAce = false; // Variable pour suivre si la banque a un As dans sa main

        for (let card of this.hand) {
            const rank = card.substring(0, card.length - 1); // Récupère la valeur de la carte sans le symbole de couleur

            if (rank === "A") {
                hasAce = true;
                score += 11; // Ajoute 11 pour l'instant, on ajustera le score plus tard si nécessaire
            } else if (["K", "Q", "J"].includes(rank)) {
                score += 10;
            } else {
                score += parseInt(rank);
            }
        }

        // Vérifie si la banque a un As et si son score dépasse 21, ajuste le score en conséquence
        if (hasAce && score > 21) {
            score -= 10;
        }

        return score;
    }
}

class Game {
    constructor() {
        this.deck = new Deck();
        this.player = new Player();
        this.bank = new Bank();
        this.pot = 0;
    }

    initGame() {
        this.showWallet();
        this.showPot();

        let reloadBtn = document.querySelector('#reload');
        let hit = document.querySelector('#hit');
        let stand = document.querySelector('#stand');
        let betBtn = document.querySelector('#betBtn');
        let bet = document.querySelector('#bet');

        reloadBtn.disabled = true;
        reloadBtn.style.visibility = 'hidden';

        hit.disabled = true;
        hit.style.visibility = 'hidden';

        stand.disabled = true;
        stand.style.visibility = 'hidden';

        betBtn.addEventListener('click', (e) => {
            this.player.bet(bet.value);
            this.pot = bet.value;
            e.target.disabled = true;
            e.target.style.visibility = 'hidden';
            bet.disabled = true;
            bet.style.visibility = 'hidden';

            hit.disabled = false;
            hit.style.visibility = 'visible';

            stand.disabled = false;
            stand.style.visibility = 'visible';

            this.showWallet();
            this.showPot();

            this.start();
            this.setPlayerScore(this.player.calculateScore());
            this.setBankScore(this.bank.calculateScore());

        });

        hit.addEventListener('click', () => {
            this.hit();
            this.setPlayerScore(this.player.calculateScore());
        });

        stand.addEventListener('click', () => {
            this.bankTurn();
            this.setBankScore(this.bank.calculateScore());
        });

        reloadBtn.addEventListener('click', (e) => {
            let finalResult = document.querySelector('#finalResult');
            let playerScore = document.querySelector('#playerScore');
            let bankScore = document.querySelector('#bankScore');
            let bankHand = document.querySelector('#bankHand');
            let playerHand = document.querySelector('#playerHand');

            finalResult.innerHTML = '';
            playerScore.innerHTML = '';
            bankScore.innerHTML = '';
            playerHand.innerHTML = '';
            bankHand.innerHTML = '';

            e.target.disabled = true;
            e.target.style.visibility = 'hidden';

            betBtn.disabled = false;
            betBtn.style.visibility = 'visible';

            bet.disabled = false;
            bet.style.visibility = 'visible';

            hit.disabled = true;
            hit.style.visibility = 'hidden';

            stand.disabled = true;
            stand.style.visibility = 'hidden';

            this.player.hand = [];
            this.bank.hand = [];
            this.pot = 0;

            this.showWallet();
            this.showPot();
            this.showHand();
            this.showBankHand();
        });
    }

    async start() {
        this.deck.shuffle();

        this.player.drawCard(this.deck.dealCard());
        this.bank.drawCard(this.deck.dealCard());
        this.player.drawCard(this.deck.dealCard());

        await this.showHand(); // Affiche la main du joueur
        await this.showBankHand();

        this.setPlayerScore(this.player.calculateScore());
        this.setBankScore(this.bank.calculateScore());
    }

    // 0 = rester | 1 = tirer une carte
    playTurn(choise) {
        if (choise == 1) {
            this.hit();
            // this.showHand();
        } else {
            this.stand();
        }
    }

    showPot() {
        let pot = document.querySelector('#pot');
        pot.innerHTML = `pot: ${this.pot}`;
    }

    showWallet() {
        let playerWallet = document.querySelector('#playerWallet');
        playerWallet.textContent = `Wallet : ${this.player.wallet}`;
    }

    async showHand() {
        let playerHand = document.querySelector('#playerHand');

        this.player.hand.forEach((card, index) => {
            if (!document.querySelector(`#card_${card}`)) {
                playerHand.innerHTML += `
              <img id='card_${card}' class='cards card-animation' src='./assets/png/blue_back.png1' alt='${card}'/>
            `;
            }
            this.animateCard(card, index);
        });

        if (this.player.calculateScore() == 21) {
            this.bankTurn();
        }
    }

    async showBankHand() {
        let bankHand = document.querySelector('#bankHand');

        this.bank.hand.forEach((card, index) => {
            if (!document.querySelector(`#card_${card}`)) {
                bankHand.innerHTML += `
              <img id='card_${card}' class='cards card-animation' src='./assets/png/blue_back.png1' alt='${card}'/>
            `;
            }
            this.animateCard(card, index, bankHand);
        });
    }

    animateCard(card, index, targetElement) {
        return new Promise(resolve => {
            setTimeout(() => {
                const cardElement = document.querySelector(`#card_${card}`);
                if (!cardElement.classList.contains('active')) {
                    cardElement.classList.add('active');
                    cardElement.src = `./assets/png/${card}.png1`;
                }
                resolve();
            }, 500 * index);
        });
    }

    hit() {
        this.player.drawCard(this.deck.dealCard());
        this.showHand();
        if (this.player.calculateScore() == 21) {
            this.bankTurn();
        } else if (this.player.calculateScore() > 21) {
            this.end();
        }
    }

    stand() {
        this.bankTurn();
    }

    bankTurn() {
        while (this.bank.calculateScore() < 17) {
            this.bank.drawCard(this.deck.dealCard());
            this.showBankHand();
        }
        this.end();
    }

    setPlayerScore(score) {
        document.querySelector('#playerScore').textContent = `Player Score: ${score}`;
    }

    setBankScore(score) {
        document.querySelector('#bankScore').textContent = `Bank Score: ${score}`;
    }

    end() {
        return new Promise(resolve => {
            let finalResult = document.querySelector('#finalResult');
            let hit = document.querySelector('#hit');
            let stand = document.querySelector('#stand');
            let reloadBtn = document.querySelector('#reload');

            reloadBtn.disabled = false;
            reloadBtn.style.visibility = 'visible';

            if (this.bank.calculateScore() > 21) {
                this.player.wallet += this.pot * 2;
                finalResult.innerHTML = `
                    <h1>Le joueur a gagné</h1>
                `;
                hit.disabled = true;
                stand.disabled = true;
            } else {
                if (this.player.calculateScore() > 21) {
                    finalResult.innerHTML = `
                        <h1>La banque a gagné</h1>
                    `;
                    hit.disabled = true;
                    stand.disabled = true;
                } else {
                    if (this.player.calculateScore() == this.bank.calculateScore()) {
                        this.player.wallet += this.pot;
                        finalResult.innerHTML = `
                            <h1>ÉGALITÉ</h1>
                        `;
                        hit.disabled = true;
                        stand.disabled = true;
                    } else if (this.player.calculateScore() > this.bank.calculateScore()) {
                        this.player.wallet += this.pot * 2;
                        finalResult.innerHTML = `
                            <h1>Le joueur a gagné</h1>
                        `;
                        hit.disabled = true;
                        stand.disabled = true;
                    } else {
                        finalResult.innerHTML = `
                            <h1>La banque a gagné</h1>
                        `;
                        hit.disabled = true;
                        stand.disabled = true;
                    }
                }
            }

            this.setPlayerScore(this.player.calculateScore());
            this.setBankScore(this.bank.calculateScore());
        });
    }


}

const game = new Game();

document.addEventListener('DOMContentLoaded', () => {
    game.initGame();
});
