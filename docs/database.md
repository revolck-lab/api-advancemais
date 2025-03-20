### Database:

#### Criado um schema simples para os testes da primeira sprint.
O banco inicial contará com duas tabelas.

Na tabela "users", serão cadastrados os seguintes campos:

- id: será auto_increment.
- full_name: terá um limite de até 255 caracteres, mas somente os caracteres necessários serão cadastrados. Este campo é obrigatório (not null) e deve conter, no mínimo, 1 caractere para registrar os dados.
- cpf: terá 11 caracteres e também será obrigatório (not null). Além disso, contará com uma função que verifica e valida os valores antes do cadastro.
- password: poderá ter até 255 caracteres, mas somente os caracteres necessários serão cadastrados.
- email: terá um limite de até 255 caracteres, mas também cadastrará apenas os caracteres necessários. Além disso, contará com uma função para verificar e validar os valores.

Na tabela "user_details", serão cadastrados os seguintes campos:

- user_id: fará referência à tabela "users" e à coluna "id".
- date: irá cadastrar a data de nascimento no formato norte-americano.
- gender: terá um limite de até 20 caracteres, mas somente os caracteres necessários serão cadastrados.
- phone: terá 11 caracteres e contará com uma função para validar os valores.

```sql
create table users (
    id int auto_increment primary key,
  	full_name varchar(255) not null,
  	cpf char(11) not null,
  	password varchar(255) not null,
  	email varchar(255) not null,
  	check (cpf regexp '^[0-9]{11}$'),
  	check (email regexp '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$')
);

create table user_details (
		user_id int,
  	birth_date date,
  	gender varchar(20),
		phone varchar(11),
  	foreign key (user_id) references users(id) on delete cascade,
		check (phone regexp '^[0-9]{11}$')
);
```
