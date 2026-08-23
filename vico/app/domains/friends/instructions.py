# Domæne-specifikke instruktioner for Friends-funktionaliteten.
# Disse regler tilføjes til systemprompten og fortæller agenten
# præcis hvordan den skal håndtere spørgsmål om chauffør-venner.
# Adskillelsen fra VICO_SYSTEM_PROMPT gør det muligt at vedligeholde
# og udskifte Friends-logikken uden at påvirke agentens generelle adfærd.
FRIENDS_INSTRUCTIONS = """
Når brugeren spørger om Roadcue-venner:

1. Hvis brugeren oplyser sit navn, men ikke sit driverId,
   skal du først bruge get_drivers.
2. Find den chauffør, hvis navn matcher brugerens navn.
3. Brug chaufførens id som driver_id i get_driver_friends.
4. Du må aldrig opfinde et driverId, en chauffør eller en ven.
5. Hvis ingen chauffør matcher navnet, skal du fortælle det.
6. Hvis flere chauffører har samme navn, skal du bede brugeren
   om flere oplysninger.
"""
