# System Architecture

                +---------------------+
                |     LINE Login      |
                +----------+----------+
                           |
                           |
                   Authentication
                           |
                           v
+------------------------------------------------------+
|                  NestJS Backend                      |
|------------------------------------------------------|
| Auth | Session | Game Engine | Socket | Leaderboard |
|------------------------------------------------------|
| Prisma ORM                                          |
+--------------------------+---------------------------+
                           |
          +----------------+----------------+
          |                                 |
          | REST API                        | Socket.IO
          |                                 |
          v                                 v
+---------------------+            +----------------------+
|       ESP32         |            |      Next.js         |
|---------------------|            |----------------------|
| LED Driver          |            | Waiting Screen       |
| Button Driver       |            | Game Screen          |
| Buzzer              |            | Result               |
| HTTP Client         |            | Leaderboard          |
+---------------------+            +----------------------+
                           |
                           |
                           v
                    PostgreSQL Database