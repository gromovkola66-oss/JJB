using UnityEngine;

namespace SCPBreach
{
    public class TurnManager : MonoBehaviour
    {
        public int currentPlayerIndex = 0;
        public GamePhase currentPhase = GamePhase.FactionSelect;
        public bool hasPlayedCardThisTurn = false;

        private GameManager gameManager;
        private BattleSystem battleSystem;

        private void Start()
        {
            gameManager = GameManager.Instance;
            battleSystem = gameManager.battleSystem;
        }

        public void StartTurn()
        {
            hasPlayedCardThisTurn = false;
            currentPhase = GamePhase.DrawPhase;
            ExecuteDrawPhase();
        }

        public void NextPhase()
        {
            switch (currentPhase)
            {
                case GamePhase.DrawPhase:
                    currentPhase = GamePhase.PlayPhase;
                    break;

                case GamePhase.PlayPhase:
                    currentPhase = GamePhase.BattlePhase;
                    ExecuteBattlePhase();
                    break;

                case GamePhase.BattlePhase:
                    currentPhase = GamePhase.EndPhase;
                    ExecuteEndPhase();
                    break;

                case GamePhase.EndPhase:
                    EndTurn();
                    break;
            }

            if (gameManager.uiManager != null)
                gameManager.uiManager.ShowPhaseIndicator(currentPhase);
        }

        public void EndTurn()
        {
            // Switch to other player
            currentPlayerIndex = (currentPlayerIndex == 0) ? 1 : 0;
            StartTurn();
        }

        private void ExecuteDrawPhase()
        {
            PlayerState currentPlayer = gameManager.GetCurrentPlayer();
            CardData drawnCard = currentPlayer.DrawCard();

            if (drawnCard == null)
            {
                // Deck empty: player takes 3 HP damage
                currentPlayer.TakeDamage(3);

                if (!currentPlayer.IsAlive())
                {
                    currentPhase = GamePhase.GameOver;
                    int winnerIndex = (currentPlayerIndex == 0) ? 1 : 0;
                    if (gameManager.uiManager != null)
                        gameManager.uiManager.ShowWinScreen(winnerIndex);
                    return;
                }
            }

            // Auto-advance to play phase
            NextPhase();
        }

        private void ExecuteBattlePhase()
        {
            PlayerState attacker = gameManager.GetCurrentPlayer();
            PlayerState defender = gameManager.GetOpponentPlayer();

            if (attacker.skipNextBattle)
            {
                attacker.skipNextBattle = false;
            }
            else
            {
                battleSystem.ExecuteBattle(attacker, defender);
            }

            // Check win conditions after battle
            if (!defender.IsAlive())
            {
                currentPhase = GamePhase.GameOver;
                if (gameManager.uiManager != null)
                    gameManager.uiManager.ShowWinScreen(currentPlayerIndex);
                return;
            }

            if (!attacker.IsAlive())
            {
                currentPhase = GamePhase.GameOver;
                int winnerIndex = (currentPlayerIndex == 0) ? 1 : 0;
                if (gameManager.uiManager != null)
                    gameManager.uiManager.ShowWinScreen(winnerIndex);
                return;
            }

            // Auto-advance to end phase
            NextPhase();
        }

        private void ExecuteEndPhase()
        {
            // Check win conditions
            if (gameManager.CheckWinCondition())
                return;

            // Auto-advance: switch to other player
            NextPhase();
        }
    }
}
