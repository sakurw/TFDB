-- TFDB.`User` definition

CREATE TABLE `User` (
  `DiscordId` bigint NOT NULL,
  `DiscordName` text NOT NULL,
  PRIMARY KEY (`DiscordId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;