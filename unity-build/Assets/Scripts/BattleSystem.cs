using System.Collections.Generic;
using UnityEngine;

namespace SCPBreach
{
    public class BattleSystem : MonoBehaviour
    {
        public void ExecuteBattle(PlayerState attacker, PlayerState defender)
        {
            for (int slot = 0; slot < 3; slot++)
            {
                CardInstance attackerCard = attacker.field[slot];
                CardInstance defenderCard = defender.field[slot];

                if (attackerCard == null)
                    continue;

                if (defenderCard != null)
                {
                    // Mutual combat: both deal ATK damage to each other's DEF
                    defenderCard.TakeDamage(attackerCard.data.attack);
                    attackerCard.TakeDamage(defenderCard.data.attack);

                    // Check if defender card is destroyed
                    if (defenderCard.IsDestroyed())
                    {
                        defender.discardPile.Add(defenderCard.data);
                        defender.field[slot] = null;
                    }

                    // Check if attacker card is destroyed
                    if (attackerCard.IsDestroyed())
                    {
                        attacker.discardPile.Add(attackerCard.data);
                        attacker.field[slot] = null;
                    }
                }
                else
                {
                    // No opposing card - damage goes directly to defender HP
                    defender.TakeDamage(attackerCard.data.attack);
                }
            }
        }

        public void ApplyItemEffect(CardData item, PlayerState user, PlayerState opponent)
        {
            switch (item.itemEffect)
            {
                case ItemEffect.Heal5HP:
                    user.HealHP(5);
                    break;

                case ItemEffect.Deal4Damage:
                    DealDamageToRandomEnemyCard(opponent, 4);
                    break;

                case ItemEffect.Plus3DEF:
                    AddDEFToUserCard(user, 3);
                    break;

                case ItemEffect.SkipBattle:
                    opponent.skipNextBattle = true;
                    break;

                case ItemEffect.DestroyLowestDEF:
                    DestroyLowestDEFCard(opponent);
                    break;
            }
        }

        private void DealDamageToRandomEnemyCard(PlayerState opponent, int damage)
        {
            List<int> occupiedSlots = new List<int>();
            for (int i = 0; i < opponent.field.Length; i++)
            {
                if (opponent.field[i] != null)
                    occupiedSlots.Add(i);
            }

            if (occupiedSlots.Count == 0)
                return;

            int randomIndex = Random.Range(0, occupiedSlots.Count);
            int targetSlot = occupiedSlots[randomIndex];
            opponent.field[targetSlot].TakeDamage(damage);

            if (opponent.field[targetSlot].IsDestroyed())
            {
                opponent.discardPile.Add(opponent.field[targetSlot].data);
                opponent.field[targetSlot] = null;
            }
        }

        private void AddDEFToUserCard(PlayerState user, int amount)
        {
            List<int> occupiedSlots = new List<int>();
            for (int i = 0; i < user.field.Length; i++)
            {
                if (user.field[i] != null)
                    occupiedSlots.Add(i);
            }

            if (occupiedSlots.Count == 0)
                return;

            int randomIndex = Random.Range(0, occupiedSlots.Count);
            int targetSlot = occupiedSlots[randomIndex];
            user.field[targetSlot].currentDEF += amount;
        }

        private void DestroyLowestDEFCard(PlayerState opponent)
        {
            int lowestDEF = int.MaxValue;
            int lowestSlot = -1;

            for (int i = 0; i < opponent.field.Length; i++)
            {
                if (opponent.field[i] != null && opponent.field[i].currentDEF < lowestDEF)
                {
                    lowestDEF = opponent.field[i].currentDEF;
                    lowestSlot = i;
                }
            }

            if (lowestSlot >= 0)
            {
                opponent.discardPile.Add(opponent.field[lowestSlot].data);
                opponent.field[lowestSlot] = null;
            }
        }
    }
}
