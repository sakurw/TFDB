-- TFDB.ForWEB source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ForWEB` AS
select
    `fi`.`FumenId` AS `FumenId`,
    `fi`.`Title` AS `Title`,
    `fi`.`FumenCode` AS `FumenCode`,
    `fi`.`Comment` AS `Comment`,
    `fi`.`FumenTypeId` AS `FumenTypeId`,
    `ft`.`FumenType` AS `FumenType`,
    `fi`.`TimeTypeId` AS `TimeTypeId`,
    coalesce(`tt`.`TimeType`, '-') AS `TimeType`,
    `fi`.`DiscordId` AS `DiscordId`,
    `u`.`DiscordName` AS `DiscordName`,
    `fi`.`RegisterTime` AS `RegisterTime`
from
    (((`FumenInfor` `fi`
join `FumenType` `ft` on
    ((`fi`.`FumenTypeId` = `ft`.`FumenTypeId`)))
join `TimeType` `tt` on
    ((`fi`.`TimeTypeId` = `tt`.`TimeTypeId`)))
join `User` `u` on
    ((`fi`.`DiscordId` = `u`.`DiscordId`)))
order by
    `fi`.`FumenId` ASC WITH CASCADED CHECK OPTION;