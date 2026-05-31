using System.Collections.Generic;
using UnityEngine;

namespace SCPBreach
{
    public static class CardDatabase
    {
        public static List<CardData> GetFactionCards(Faction faction)
        {
            string path = "Cards/" + faction.ToString();
            CardData[] cards = Resources.LoadAll<CardData>(path);
            return new List<CardData>(cards);
        }

        public static List<CardData> GetItemCards()
        {
            CardData[] cards = Resources.LoadAll<CardData>("Cards/Items");
            return new List<CardData>(cards);
        }
    }
}
