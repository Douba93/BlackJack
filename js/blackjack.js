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
        return this.deck.pop();
    }
}

class Player {
    constructor() {
        this.hand = []; // Main du joueur, initialisée comme une liste vide
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

    }

    initGame() {
        this.start();
        this.setPlayerScore(this.player.calculateScore());
        this.setBankScore(this.bank.calculateScore());

        let reloadBtn = document.querySelector('#reload');
        reloadBtn.disabled = true;
        reloadBtn.style.visibility = 'hidden';

        document.querySelector('#hit').addEventListener('click', () => {
            this.hit();
            this.setPlayerScore(this.player.calculateScore());
        });
        document.querySelector('#stand').addEventListener('click', () => {
            this.bankTurn();
            this.setBankScore(this.bank.calculateScore());
        });
        reloadBtn.addEventListener('click', (e) => {
            let finalResult = document.querySelector('#finalResult');
            let hit = document.querySelector('#hit');
            let stand = document.querySelector('#stand');

            finalResult.innerHTML = '';
            stand.disabled = false;
            hit.disabled = false;
            e.target.disabled = true;
            e.target.style.visibility = 'hidden';

            this.player.hand = [];
            this.bank.hand = [];
            this.showHand();
            this.start();
            this.setPlayerScore(this.player.calculateScore());
            this.setBankScore(this.bank.calculateScore());
        });
    }

    start() {
        this.deck.shuffle();

        this.player.drawCard(this.deck.dealCard());
        this.bank.drawCard(this.deck.dealCard());
        this.player.drawCard(this.deck.dealCard());

        this.showHand(); // Affiche la main du joueur
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

    showHand() {

        let playerHand = document.querySelector('#playerHand');
        let bankHand = document.querySelector('#bankHand');

        playerHand.innerHTML = '';
        bankHand.innerHTML = '';

        for (let card of this.player.hand) {
            playerHand.innerHTML += `
                <img class='cards' src='./assets/png/${card}.png1' alt='${card}'/>
            `;
        }

        for (let card of this.bank.hand) {
            playerHand.innerHTML += `
                <img class='cards' src='./assets/png/${card}.png1' alt='${card}'/>
            `;
        }

        if (this.player.calculateScore() == 21) {
            this.bankTurn();
        }
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
            this.showHand();
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
        let finalResult = document.querySelector('#finalResult');
        let hit = document.querySelector('#hit');
        let stand = document.querySelector('#stand');
        let reloadBtn = document.querySelector('#reload');

        reloadBtn.disabled = false;
        reloadBtn.style.visibility = 'visible';

        if (this.bank.calculateScore() > 21) {
            finalResult.innerHTML = `
                <h1>Le joueur a gagner</h1>
            `;
            hit.disabled = true;
            stand.disabled = true;
        } else {
            if (this.player.calculateScore() > 21) {
                finalResult.innerHTML = `
                <h1>La banque a gagner</h1>
            `;
                hit.disabled = true;
                stand.disabled = true;
            } else {
                if (this.player.calculateScore() == this.bank.calculateScore()) {
                    finalResult.innerHTML = `
                        <h1>EGALITE</h1>
                    `;
                    hit.disabled = true;
                    stand.disabled = true;
                }
                if (this.player.calculateScore() > this.bank.calculateScore()) {
                    finalResult.innerHTML = `
                        <h1>Le joueur a gagner</h1>
                    `;
                    hit.disabled = true;
                    stand.disabled = true;
                }
                if (this.player.calculateScore() < this.bank.calculateScore()) {
                    finalResult.innerHTML = `
                        <h1>La banque a gagner</h1>
                    `;
                    hit.disabled = true;
                    stand.disabled = true;
                }
            }
        }
    }
}

const game = new Game();

document.addEventListener('DOMContentLoaded', () => {
    game.initGame();
});
