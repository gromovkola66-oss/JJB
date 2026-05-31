using System.Collections.Generic;
using UnityEngine;

namespace SCPBreach
{
    public class DeckManager : MonoBehaviour
    {
        public List<CardData> BuildDeck(Faction faction)
        {
            List<CardData> factionCards = CardDatabase.GetFactionCards(faction);
            List<CardData> itemCards = CardDatabase.GetItemCards();

            List<CardData> deck = new List<CardData>();

            // Add faction cards (up to 30, duplicating if needed)
            int factionCount = 0;
            while (factionCount < 30 && factionCards.Count > 0)
            {
                foreach (CardData card in factionCards)
                {
                    if (factionCount >= 30)
                        break;
                    deck.Add(card);
                    factionCount++;
                }
            }

            // Add 5 item cards
            int itemCount = 0;
            foreach (CardData item in itemCards)
            {
                if (itemCount >= 5)
                    break;
                deck.Add(item);
                itemCount++;
            }

            ShuffleDeck(deck);
            return deck;
        }

        public void ShuffleDeck(List<CardData> deck)
        {
            // Fisher-Yates shuffle
            for (int i = deck.Count - 1; i > 0; i--)
            {
                int j = Random.Range(0, i + 1);
                CardData temp = deck[i];
                deck[i] = deck[j];
                deck[j] = temp;
            }
        }
    }
}
