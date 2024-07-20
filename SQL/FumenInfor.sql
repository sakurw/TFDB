-- TFDB.FumenInfor definition

CREATE TABLE `FumenInfor` (
  `FumenId` int NOT NULL AUTO_INCREMENT,
  `FumenCode` longtext NOT NULL,
  `Title` text NOT NULL,
  `DiscordId` bigint NOT NULL,
  `RegisterTime` datetime NOT NULL,
  `Comment` text,
  `TimeTypeId` int DEFAULT '0',
  `FumenTypeId` int NOT NULL,
  `Page` int NOT NULL,
  `DeleteFlag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`FumenId`),
  KEY `DiscordId` (`DiscordId`),
  KEY `TimeTypeId` (`TimeTypeId`),
  KEY `FumenTypeId` (`FumenTypeId`),
  CONSTRAINT `FumenInfor_ibfk_1` FOREIGN KEY (`DiscordId`) REFERENCES `User` (`DiscordId`),
  CONSTRAINT `FumenInfor_ibfk_2` FOREIGN KEY (`TimeTypeId`) REFERENCES `TimeType` (`TimeTypeId`),
  CONSTRAINT `FumenInfor_ibfk_3` FOREIGN KEY (`FumenTypeId`) REFERENCES `FumenType` (`FumenTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=7816 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;