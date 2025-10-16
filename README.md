## Dependencies:
- *Nodejs*
- *pnpm*
- *Docker and Docker Compose*

## PostgreSQL initialization
- **Docker :** `docker-compose up -d`

## Run:

### Create .env files
- **Backend:**
```
GOOGLE_CLIENT_ID=<GOOGLE_AUTHENTICATION_CLIENT_ID>
JWT_SECRET=<SECRET>
```
- **Frontend:**
```
PUBLIC_GOOGLE_CLIENT_ID=<GOOGLE_AUTHENTICATION_CLIENT_ID>
PUBLIC_API_URL=http://localhost:3000
```

### Create custom localhost
Edit the /etc/hosts file and add:
```
127.0.0.1        dev.sisacad.local
```

### Run
- **Backend:**
```bash
cd sisacad
pnpm install
pnpm run start
```

- **Frontend**
```
cd Sisacad_frontend
pnpm install
pnpm run dev
```

## Seeding
- **Requirements:**
    + **students.csv**
    ```csv
    cui,firstLastName,secondLastName,name,email,semester
    ```
    + **teachers.csv**
    ```csv
    name,firstLastName,secondLastName,email
    ```
    + **secretaries.csv**
    ```csv
    name,firstLastName,secondLastName,email
    ```
    + **admins.csv**
    ```csv
    name,firstLastName,secondLastName,email
    ```
    + **courses.csv**
    ```csv
    code,name,credits,prrq_1,prrq_2,semester
    ```
- **Run**
```
cd sisacad
pnpm run seed
```
## Suggestion
- It may ask you for administrator permissions to launch the backend.

