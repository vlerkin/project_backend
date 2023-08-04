Recipe website, backend part of the project.

We created this project during 4th week our Mind Mingle Bootcamp.

Our goal was to create a website with functionality to add a recipe, display all recipes, login registered users and show user's recipes. We had in mind to add edit and delete functionality and in API you can find all requests that correspond to our needs and even more. 

Technologies we used:
TypeScript, Express, Prisma ORM, SQLite, CORS, JWT (web tokens), HTTPie.

The database has four tables with one-to-many and implicit many-to-many.

How to use:
1. Clone the project folder from github:
```
git clone git@github.com:vlerkin/project_backend.git
```
2. Install the dependencies:
```
npm install
```
3. Set up the database, start with installing prisma and prisma client, then populate the db's tables:
```
npm init -y
npx tsc --init
npx prisma init
npx prisma db push
```
Now you can populate the database running seed scripts. First, seed user table, then run seedMany and populate category and recipe tables and then comment table can be seeded:
```
npx tsx *seed.ts/seedMany.ts*
```
After this you need to push changes into prisma
```
npx prisma db push
```
now you can use UI interface to see the database by running the following command: 
```
npx prisma studio
```
4. Now you can start server, navigate to project_backend folder you cloned, it's good to use separate terminal and out it on watch mode:
```
npx tsx watch server.ts
```
5. To test API you can use HTTPie to send requests and fetch data in JSON.


















