const authorization = {
    checkRole: (role) => {
        return (req, res, next) => {
            if (!req.user || req.user.role_id !== role) {
                return res.status(403).json({ error: `Access denied: This resource is for ${role}s only` });
            }
            next();
        };
    },

    teacher: (req, res, next) => authorization.checkRole(1)(req, res, next), // Instrutores
    student: (req, res, next) => authorization.checkRole(2)(req, res, next), // Alunos 
    company: (req, res, next) => authorization.checkRole(3)(req, res, next), // Empresas
    admin: (req, res, next) => authorization.checkRole(4)(req, res, next), // Administradores
    recruiter: (req, res, next) => authorization.checkRole(5)(req, res, next), // piscólogas
    pedagogical: (req, res, next) => authorization.checkRole(6)(req, res, next), // setor pedagógico.
    hr: (req, res, next) => authorization.checkRole(7)(req, res, next), // setor de vagas
    superAdmin: (req, res, next) => authorization.checkRole(8)(req, res, next), // super administrador

    accessLevel: (requiredLevel) => {
        return (req, res, next) => {
            const level = req.user.role_id;
            if (level < requiredLevel) {
                return res.status(403).json({ error: `Access denied: You need level ${requiredLevel} to access this resource.` });
            }
            next();
        }
    }
};

module.exports = authorization;
