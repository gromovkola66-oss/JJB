namespace SCPBreach
{
    public enum Faction
    {
        None,
        MOG,
        Chaos,
        GOC
    }

    public enum CardType
    {
        Unit,
        Item
    }

    public enum ItemEffect
    {
        None,
        Heal5HP,
        Deal4Damage,
        Plus3DEF,
        SkipBattle,
        DestroyLowestDEF
    }

    public enum GamePhase
    {
        FactionSelect,
        DrawPhase,
        PlayPhase,
        BattlePhase,
        EndPhase,
        GameOver
    }
}
