using System.Collections.Generic;
using UnityEngine;

namespace SCPBreach
{
    public static class CardDatabase
    {
        private static List<CardData> allCards;

        public static List<CardData> GetAllCards()
        {
            EnsureInitialized();
            return new List<CardData>(allCards);
        }

        public static List<CardData> GetFactionCards(Faction faction)
        {
            EnsureInitialized();
            List<CardData> result = new List<CardData>();
            foreach (CardData card in allCards)
            {
                if (card.faction == faction && card.cardType == CardType.Unit)
                    result.Add(card);
            }
            return result;
        }

        public static List<CardData> GetItemCards()
        {
            EnsureInitialized();
            List<CardData> result = new List<CardData>();
            foreach (CardData card in allCards)
            {
                if (card.cardType == CardType.Item)
                    result.Add(card);
            }
            return result;
        }

        private static void EnsureInitialized()
        {
            if (allCards != null) return;
            allCards = new List<CardData>();
            allCards.AddRange(CreateMOGCards());
            allCards.AddRange(CreateChaosCards());
            allCards.AddRange(CreateGOCCards());
            allCards.AddRange(CreateItemCards());
        }

        private static CardData CreateCard(string name, Faction faction, CardType type, int atk, int def, string desc = "", ItemEffect effect = ItemEffect.None)
        {
            CardData card = ScriptableObject.CreateInstance<CardData>();
            card.cardName = name;
            card.faction = faction;
            card.cardType = type;
            card.attack = atk;
            card.defense = def;
            card.description = desc;
            card.itemEffect = effect;
            card.name = name;
            return card;
        }

        private static List<CardData> CreateMOGCards()
        {
            List<CardData> cards = new List<CardData>();
            Faction f = Faction.MOG;
            CardType t = CardType.Unit;

            // Weak (10)
            cards.Add(CreateCard("Рекрут МОГ", f, t, 2, 3));
            cards.Add(CreateCard("Связист", f, t, 1, 4));
            cards.Add(CreateCard("Сапёр", f, t, 3, 2));
            cards.Add(CreateCard("Медик-стажёр", f, t, 1, 3));
            cards.Add(CreateCard("Патрульный", f, t, 2, 2));
            cards.Add(CreateCard("Дозорный", f, t, 2, 3));
            cards.Add(CreateCard("Оператор дрона", f, t, 1, 4));
            cards.Add(CreateCard("Техник", f, t, 2, 2));
            cards.Add(CreateCard("Водитель БТР", f, t, 1, 4));
            cards.Add(CreateCard("Снайпер-новичок", f, t, 3, 1));

            // Medium (10)
            cards.Add(CreateCard("Оперативник Эпсилон-11", f, t, 4, 5));
            cards.Add(CreateCard("Штурмовик", f, t, 5, 4));
            cards.Add(CreateCard("Полевой медик", f, t, 3, 6));
            cards.Add(CreateCard("Снайпер", f, t, 6, 3));
            cards.Add(CreateCard("Инженер-подрывник", f, t, 5, 4));
            cards.Add(CreateCard("Командир отряда", f, t, 4, 5));
            cards.Add(CreateCard("Специалист по SCP", f, t, 3, 6));
            cards.Add(CreateCard("Оперативник Ню-7", f, t, 5, 5));
            cards.Add(CreateCard("Пилот вертолёта", f, t, 4, 4));
            cards.Add(CreateCard("Тяжёлый пехотинец", f, t, 4, 6));

            // Strong (10)
            cards.Add(CreateCard("Капитан МОГ Альфа-1", f, t, 7, 8));
            cards.Add(CreateCard("Оперативник в экзоскелете", f, t, 8, 7));
            cards.Add(CreateCard("Элитный снайпер", f, t, 9, 5));
            cards.Add(CreateCard("Боевой робот Таурус", f, t, 6, 10));
            cards.Add(CreateCard("Командующий операцией", f, t, 7, 7));
            cards.Add(CreateCard("Спецназовец Омега-12", f, t, 8, 6));
            cards.Add(CreateCard("Оператор Скрантона", f, t, 6, 9));
            cards.Add(CreateCard("Ликвидатор", f, t, 9, 6));
            cards.Add(CreateCard("Тактический лидер", f, t, 7, 8));
            cards.Add(CreateCard("Ветеран Красного Правого", f, t, 8, 8));

            return cards;
        }

        private static List<CardData> CreateChaosCards()
        {
            List<CardData> cards = new List<CardData>();
            Faction f = Faction.Chaos;
            CardType t = CardType.Unit;

            // Weak (10)
            cards.Add(CreateCard("Боевик Хаоса", f, t, 3, 2));
            cards.Add(CreateCard("Диверсант", f, t, 3, 1));
            cards.Add(CreateCard("Контрабандист", f, t, 2, 2));
            cards.Add(CreateCard("Вербовщик", f, t, 1, 3));
            cards.Add(CreateCard("Хакер", f, t, 2, 2));
            cards.Add(CreateCard("Поджигатель", f, t, 3, 1));
            cards.Add(CreateCard("Мародёр", f, t, 3, 2));
            cards.Add(CreateCard("Шпион", f, t, 2, 3));
            cards.Add(CreateCard("Подрывник", f, t, 4, 1));
            cards.Add(CreateCard("Стрелок", f, t, 3, 2));

            // Medium (10)
            cards.Add(CreateCard("Командир ячейки", f, t, 5, 4));
            cards.Add(CreateCard("Тяжёлый боевик", f, t, 6, 3));
            cards.Add(CreateCard("Снайпер Хаоса", f, t, 7, 2));
            cards.Add(CreateCard("Бронированный боец", f, t, 4, 6));
            cards.Add(CreateCard("Пулемётчик", f, t, 6, 4));
            cards.Add(CreateCard("Гранатомётчик", f, t, 7, 3));
            cards.Add(CreateCard("Полевой командир", f, t, 5, 5));
            cards.Add(CreateCard("Взрывотехник", f, t, 6, 3));
            cards.Add(CreateCard("Наёмник", f, t, 5, 4));
            cards.Add(CreateCard("Оператор БПЛА", f, t, 6, 4));

            // Strong (10)
            cards.Add(CreateCard("Лидер повстанцев", f, t, 9, 6));
            cards.Add(CreateCard("Элитный диверсант", f, t, 10, 5));
            cards.Add(CreateCard("Боевая машина Тень", f, t, 8, 7));
            cards.Add(CreateCard("Мастер-подрывник", f, t, 10, 4));
            cards.Add(CreateCard("Главарь ячейки", f, t, 9, 6));
            cards.Add(CreateCard("Перебежчик Фонда", f, t, 8, 7));
            cards.Add(CreateCard("Тяжёлый мех", f, t, 7, 9));
            cards.Add(CreateCard("Ассасин", f, t, 11, 4));
            cards.Add(CreateCard("Командующий Дельта", f, t, 9, 7));
            cards.Add(CreateCard("Апостол Хаоса", f, t, 10, 6));

            return cards;
        }

        private static List<CardData> CreateGOCCards()
        {
            List<CardData> cards = new List<CardData>();
            Faction f = Faction.GOC;
            CardType t = CardType.Unit;

            // Weak (10)
            cards.Add(CreateCard("Агент ГОК", f, t, 1, 4));
            cards.Add(CreateCard("Аналитик", f, t, 1, 3));
            cards.Add(CreateCard("Щитоносец", f, t, 1, 5));
            cards.Add(CreateCard("Полевой агент", f, t, 2, 3));
            cards.Add(CreateCard("Наблюдатель", f, t, 1, 4));
            cards.Add(CreateCard("Дипломат", f, t, 0, 5));
            cards.Add(CreateCard("Техник ГОК", f, t, 2, 3));
            cards.Add(CreateCard("Медик ГОК", f, t, 1, 4));
            cards.Add(CreateCard("Оператор связи", f, t, 1, 4));
            cards.Add(CreateCard("Караульный", f, t, 2, 3));

            // Medium (10)
            cards.Add(CreateCard("Офицер Физика", f, t, 4, 6));
            cards.Add(CreateCard("Бронеагент", f, t, 3, 7));
            cards.Add(CreateCard("Оператор силового поля", f, t, 2, 8));
            cards.Add(CreateCard("Командир отделения", f, t, 4, 6));
            cards.Add(CreateCard("Специалист по аномалиям", f, t, 3, 6));
            cards.Add(CreateCard("Тяжёлый щитоносец", f, t, 2, 8));
            cards.Add(CreateCard("Тактик ГОК", f, t, 4, 5));
            cards.Add(CreateCard("Оперативник Страйк", f, t, 5, 5));
            cards.Add(CreateCard("Инженер укреплений", f, t, 3, 7));
            cards.Add(CreateCard("Пси-оператор", f, t, 4, 6));

            // Strong (10)
            cards.Add(CreateCard("Генерал ГОК", f, t, 6, 10));
            cards.Add(CreateCard("Оператор Ликвидатора", f, t, 7, 9));
            cards.Add(CreateCard("Элитный бронеагент", f, t, 6, 10));
            cards.Add(CreateCard("Командующий Цитадель", f, t, 5, 11));
            cards.Add(CreateCard("Боевой экзоскелет Mark IV", f, t, 7, 9));
            cards.Add(CreateCard("Пси-воин", f, t, 6, 9));
            cards.Add(CreateCard("Мастер обороны", f, t, 5, 11));
            cards.Add(CreateCard("Страж Коалиции", f, t, 7, 8));
            cards.Add(CreateCard("Директор операции", f, t, 6, 10));
            cards.Add(CreateCard("Железный Занавес", f, t, 8, 9));

            return cards;
        }

        private static List<CardData> CreateItemCards()
        {
            List<CardData> cards = new List<CardData>();
            Faction f = Faction.None;
            CardType t = CardType.Item;

            cards.Add(CreateCard("SCP-500 Панацея", f, t, 0, 0, "Восстановить 5 HP игроку", ItemEffect.Heal5HP));
            cards.Add(CreateCard("SCP-127 Живое оружие", f, t, 0, 0, "Нанести 4 урона случайной вражеской карте на поле", ItemEffect.Deal4Damage));
            cards.Add(CreateCard("SCP-714 Нефритовое кольцо", f, t, 0, 0, "Ваша карта на поле получает +3 к Защите", ItemEffect.Plus3DEF));
            cards.Add(CreateCard("SCP-268 Шапка-невидимка", f, t, 0, 0, "Противник пропускает следующую фазу боя", ItemEffect.SkipBattle));
            cards.Add(CreateCard("SCP-063 Зубная щётка", f, t, 0, 0, "Уничтожить вражескую карту с наименьшей Защитой", ItemEffect.DestroyLowestDEF));

            return cards;
        }
    }
}
