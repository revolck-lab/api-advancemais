-- Tabela de papel (role)
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level INT NOT NULL,
    status TINYINT(1) NOT NULL,  -- Boolean em MySQL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de gênero (gender)
CREATE TABLE gender (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

-- Tabela de escolaridade (education)
CREATE TABLE education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabela de endereço (address)
CREATE TABLE address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    number INT(8) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_id INT(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    FOREIGN KEY (state_id) REFERENCES state(id)
);

-- Tabela de categoria de cursos (category)
CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Tabela de modalidade de cursos (modality)
CREATE TABLE modality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Tabela de usuário (user)
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,  -- Validar no código
    phone_user CHAR(11) NOT NULL,
    gender_id INT NOT NULL,
    education_id INT NOT NULL,
    status TINYINT(1) DEFAULT 1,  -- Boolean em MySQL
    code_user VARCHAR(9) NOT NULL UNIQUE,
    role_id INT NOT NULL,  -- Sempre NOT NULL
    address_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gender_id) REFERENCES gender(id),
    FOREIGN KEY (education_id) REFERENCES education(id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (address_id) REFERENCES address(id)
);

-- Tabela de estado (state)
CREATE TABLE state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,  -- Faltava esta vírgula
    federal_unit CHAR(2) NOT NULL
);

-- Tabela de empresa (company)
CREATE TABLE company (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cnpj CHAR(14) NOT NULL UNIQUE,  -- Validar no código
    trade_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    address_id INT NOT NULL,
    whatsapp CHAR(11) NOT NULL,
    mobile_phone CHAR(11) NOT NULL,
    landline_phone CHAR(11),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status TINYINT(1) DEFAULT 1,  -- Boolean em MySQL
    role_id INT NOT NULL,  -- Sempre NOT NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES address(id),
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- Tabela de vaga de emprego (vacancy)
CREATE TABLE vacancy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    requirements TEXT NOT NULL,
    activities TEXT NOT NULL,
    benefits VARCHAR(255),
    notes VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('active', 'canceled', 'expired', 'under review'),
    company_id INT NOT NULL,
    area_id INT NOT NULL,
    city varchar(255) NOT NULL,
    state_id INT(2) NOT NULL,
    publisehd_date date NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (state_id) REFERENCES state(id),
    FOREIGN KEY (area_id) REFERENCES area(id)
);

--Tabela de área de trabalho
CREATE TABLE area (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL
);

-- Tabela de candidatura (application)
CREATE TABLE application (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vacancy_id INT NOT NULL,
    user_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES vacancy(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Tabela de banner
CREATE TABLE banner (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Chave primária
    image_url TEXT NOT NULL,           -- Caminho da URL
    title VARCHAR(255) NOT NULL,       -- Título fornecido pelo usuário
    device ENUM('Web', 'Mobile') NOT NULL, -- Dispositivo (Web ou Mobile)
    url_link text not null,
    author_id INT NOT NULL,            -- ID do autor que criou/alterou
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação automática
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data de atualização automática
    FOREIGN KEY (author_id) REFERENCES user(id) -- Referência à tabela de usuários
);

CREATE TRIGGER limitar_banner
BEFORE INSERT ON banner
FOR EACH ROW
BEGIN
    -- Verifica se o número de registros já é igual ou maior que 10
    IF (SELECT COUNT(*) FROM banner) >= 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite de 10 registros atingido na tabela banner.';
    END IF;
END;

-- Tabela de carrossel de empresas (carousel_company)
CREATE TABLE carousel_company (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de carrossel (carousel)
CREATE TABLE carousel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de imagem de curso (course_image)
CREATE TABLE course_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de thumbnail de curso (course_thumbnail)
CREATE TABLE course_thumbnail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thumbnail_url VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de curso (course)
CREATE TABLE course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    instructor_id INT NOT NULL,
    course_image_id INT NOT NULL,
    thumbnail_id INT NOT NULL,
    modality_id INT NOT NULL,
    workload INT NOT NULL,
    vacancies INT NOT NULL,
    price INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (instructor_id) REFERENCES user(id),
    FOREIGN KEY (course_image_id) REFERENCES course_image(id),
    FOREIGN KEY (thumbnail_id) REFERENCES course_thumbnail(id),
    FOREIGN KEY (modality_id) REFERENCES modality(id)
);

--Tabela de serviços oferecidos
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE
);

# --Tabela de pedido de orçamentos
CREATE TABLE quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    state_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    FOREIGN KEY (state_id) REFERENCES state(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE slider (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Chave primária
    image_url TEXT NOT NULL,           -- Caminho da URL
    title VARCHAR(255) NOT NULL,       -- Título fornecido pelo usuário
    device ENUM('Web', 'Mobile') NOT NULL, -- Dispositivo (Web ou Mobile)
    url_link text not null,
    author_id INT NOT NULL,            -- ID do autor que criou/alterou
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação automática
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data de atualização automática
    FOREIGN KEY (author_id) REFERENCES user(id) -- Referência à tabela de usuários
);

CREATE TRIGGER limitar_slider
BEFORE INSERT ON slider
FOR EACH ROW
BEGIN
    -- Verifica se o número de registros já é igual ou maior que 10
    IF (SELECT COUNT(*) FROM slider) >= 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite de 10 registros atingido na tabela slider.';
    END IF;
END;

CREATE TABLE smtp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  smtp_host VARCHAR(255) NOT NULL,
  smtp_port INT NOT NULL,
  smtp_username VARCHAR(255) NOT NULL,
  smtp_password VARCHAR(255) NOT NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_author
    FOREIGN KEY (author_id)
    REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE business_info (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Chave primária
    title VARCHAR(255) NOT NULL,       -- Título do negócio
    description TEXT NOT NULL,         -- Descrição do negócio
    image_url TEXT NOT NULL,           -- URL da imagem no bucket
    author_id INT NOT NULL,            -- ID do autor (referência à tabela user)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação automática
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data de atualização automática
    FOREIGN KEY (author_id) REFERENCES user(id) -- Chave estrangeira para a tabela user
);

CREATE TABLE site_info (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Chave primária
    favicon_url TEXT NOT NULL,         -- URL do favicon
    site_name VARCHAR(255) NOT NULL,    -- Nome do site
  	author_id INT NOT NULL,            -- ID do autor (referência à tabela user)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação automática
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Data de atualização automática
    FOREIGN KEY (author_id) REFERENCES user(id) -- Chave estrangeira para a tabela user
);

-- catálogo de assinaturas
CREATE TABLE signatures_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    vacancy_limit INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    periodicity VARCHAR(20) NOT NULL DEFAULT 'monthly',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- assinaturas das empresas 
CREATE TABLE signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    package_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    status ENUM('active', 'canceled', 'expired') DEFAULT 'active',
    cancellation_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (package_id) REFERENCES signatures_packages(id)
);

CREATE TABLE company_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,                        -- Referencia a tabela company
    package_id INT NOT NULL,                        -- Referencia a tabela signatures_packages
    mp_preference_id VARCHAR(50) NOT NULL,          -- ID da preferência do Mercado Pago
    payment_id VARCHAR(50) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- Status da transação (ex.: PENDING, APPROVED, CANCELLED)
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Data de início da transação
    end_date TIMESTAMP,                             -- Data de conclusão ou expiração (opcional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp de criação
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Timestamp de atualização

    -- Chaves estrangeiras
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES signatures_packages(id) ON DELETE CASCADE
);

-- Índices para otimizar consultas
CREATE INDEX idx_company_id ON company_payments(company_id);
CREATE INDEX idx_package_id ON company_payments(package_id);
CREATE INDEX idx_mp_preference_id ON company_payments(mp_preference_id);
CREATE INDEX idx_payment_id ON company_payments(payment_id);
