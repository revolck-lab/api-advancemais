import fs from "fs";
import path from "path";
import { logger } from "@shared/utils/logger";
import { mailConfig } from "@shared/config/mail";

/**
 * Lê um template de email do sistema de arquivos
 */
export const readTemplate = (templateName: string): string | null => {
  try {
    const templatesDir = mailConfig.templatesDir;
    const templatePath = path.join(
      process.cwd(),
      templatesDir,
      `${templateName}.html`
    );

    if (!fs.existsSync(templatePath)) {
      logger.error(`Template de email não encontrado: ${templatePath}`);
      return null;
    }

    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    logger.error(`Erro ao ler template de email ${templateName}:`, error);
    return null;
  }
};

/**
 * Compila um template de email, substituindo as variáveis pelos valores
 */
export const compileTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  let compiledTemplate = template;

  // Adicionar variáveis globais padrão
  const allVariables = {
    ...mailConfig.getTemplateVars(),
    ...variables,
  };

  // Substituir todas as variáveis no formato {{variavel}}
  Object.entries(allVariables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    compiledTemplate = compiledTemplate.replace(regex, value?.toString() || "");
  });

  return compiledTemplate;
};

/**
 * Lê e compila um template de email
 */
export const getCompiledTemplate = (
  templateName: string,
  variables: Record<string, any>
): string | null => {
  const template = readTemplate(templateName);

  if (!template) {
    return null;
  }

  return compileTemplate(template, variables);
};
