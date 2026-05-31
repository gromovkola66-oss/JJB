using UnityEngine;

namespace SCPBreach
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public PlayerState player1 = new PlayerState();
        public PlayerState player2 = new PlayerState();

        public TurnManager turnManager;
        public BattleSystem battleSystem;
        public DeckManager deckManager;
        public UIManager uiManager;

        public GamePhase gameState = GamePhase.FactionSelect;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void StartGame(Faction p1Faction, Faction p2Faction)
        {
            // Set factions
            player1.faction = p1Faction;
            player2.faction = p2Faction;

            // Build decks
            player1.deck = deckManager.BuildDeck(p1Faction);
            player2.deck = deckManager.BuildDeck(p2Faction);

            // Shuffle decks
            deckManager.ShuffleDeck(player1.deck);
            deckManager.ShuffleDeck(player2.deck);

            // Draw starting hands (5 cards each)
            for (int i = 0; i < 5; i++)
            {
                player1.DrawCard();
                player2.DrawCard();
            }

            // Randomly pick first player
            turnManager.currentPlayerIndex = Random.Range(0, 2);

            // Update game state
            gameState = GamePhase.DrawPhase;

            // Hide faction select UI
            if (uiManager != null)
            {
                uiManager.HideFactionSelect();
                uiManager.UpdateHP(player1.hp, player2.hp);
                uiManager.UpdateField(player1, player2);
            }

            // Start first turn
            turnManager.StartTurn();
        }

        public PlayerState GetCurrentPlayer()
        {
            return turnManager.currentPlayerIndex == 0 ? player1 : player2;
        }

        public PlayerState GetOpponentPlayer()
        {
            return turnManager.currentPlayerIndex == 0 ? player2 : player1;
        }

        public bool CheckWinCondition()
        {
            if (!player1.IsAlive())
            {
                gameState = GamePhase.GameOver;
                if (uiManager != null)
                    uiManager.ShowWinScreen(1);
                return true;
            }

            if (!player2.IsAlive())
            {
                gameState = GamePhase.GameOver;
                if (uiManager != null)
                    uiManager.ShowWinScreen(0);
                return true;
            }

            return false;
        }

        public void UpdateUI()
        {
            if (uiManager == null)
                return;

            uiManager.UpdateHP(player1.hp, player2.hp);
            uiManager.UpdateField(player1, player2);
            uiManager.ShowPhaseIndicator(turnManager.currentPhase);

            PlayerState currentPlayer = GetCurrentPlayer();
            uiManager.UpdateHand(currentPlayer, true);
        }
    }
}
