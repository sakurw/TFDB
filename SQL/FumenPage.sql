-- TFDB.FumenPage definition

CREATE TABLE `FumenPage` (
  `FumenId` int NOT NULL,
  `FumenPage` int NOT NULL,
  `FumenPageCode` longtext NOT NULL,
  `FumenPage01` char(240) NOT NULL,
  PRIMARY KEY (`FumenId`,`FumenPage`),
  CONSTRAINT `FumenPage_ibfk_1` FOREIGN KEY (`FumenId`) REFERENCES `FumenInfor` (`FumenId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;