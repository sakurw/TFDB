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

-- TFDB.FumenPage definition

CREATE TABLE `FumenPage` (
  `FumenId` int NOT NULL,
  `FumenPage` int NOT NULL,
  `FumenPageCode` longtext NOT NULL,
  `FumenPage01` char(240) NOT NULL,
  PRIMARY KEY (`FumenId`,`FumenPage`),
  CONSTRAINT `FumenPage_ibfk_1` FOREIGN KEY (`FumenId`) REFERENCES `FumenInfor` (`FumenId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TFDB.FumenType definition

CREATE TABLE `FumenType` (
  `FumenTypeId` int NOT NULL,
  `FumenType` text NOT NULL,
  PRIMARY KEY (`FumenTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TFDB.TimeType definition

CREATE TABLE `TimeType` (
  `TimeTypeId` int NOT NULL,
  `TimeType` text,
  PRIMARY KEY (`TimeTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TFDB.`User` definition

CREATE TABLE `User` (
  `DiscordId` bigint NOT NULL,
  `DiscordName` text NOT NULL,
  PRIMARY KEY (`DiscordId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;