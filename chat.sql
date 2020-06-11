CREATE TABLE "chat"
(
 "chat_id"      serial NOT NULL,
 "name"         varchar(50) NOT NULL,
 "time_created" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PK_chats" PRIMARY KEY ( "chat_id" )
);

INSERT INTO chat(chat_id,name) VALUES (0,'Home'),(1,'Chat1');

CREATE TABLE "consumer"
(
 "consumer_id"      serial NOT NULL,
 "display_name" varchar(50) NOT NULL,
 "color"        varchar(50) NOT NULL,
 "time_created" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PK_consumers" PRIMARY KEY ( "consumer_id" )
);


CREATE TABLE "comment"
(
 "comment_id"   serial NOT NULL,
 "message"      varchar(400) NOT NULL,
 "consumer_id"      integer NOT NULL,
 "time_created" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "chat_id"      integer NOT NULL,
 CONSTRAINT "PK_comments" PRIMARY KEY ( "comment_id" ),
 CONSTRAINT "FK_40" FOREIGN KEY ( "consumer_id" ) REFERENCES "consumer" ( "consumer_id" ),
 CONSTRAINT "FK_74" FOREIGN KEY ( "chat_id" ) REFERENCES "chat" ( "chat_id" )
);