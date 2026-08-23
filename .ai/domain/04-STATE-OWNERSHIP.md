# State ownership

| State | Autoritativ ejer |
|---|---|
| Login, driver-ID og tilladelser | C# request/auth context |
| Drivers, venner, positioner, beskeder og observationer | C# + SQL Server |
| Præcise beregninger og forretningsstatus | C# application/domain services |
| Samtalebeskeder og sproglig referencekontekst | LangGraph conversation state |
| Toolresultater i et aktivt agentflow | LangGraph state, med C# som datakilde |
| Ventende communityflow og genoptagelses-ID | C# som varig procesrecord; LangGraph orkestrerer |
| Midlertidig UI-state og oplæsning | Angular-klienten |

Agentstate er ikke en erstatning for autoritativ forretningsstate. Data, der skal overleve en procesgenstart eller bruges til autorisation, skal gemmes gennem C#.

