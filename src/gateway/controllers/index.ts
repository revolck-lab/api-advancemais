/**
 * Centraliza a exportação dos controladores do gateway
 * Facilita a importação e gerenciamento dos controladores
 */

import BaseController from "./base.controller";
import SystemController from "./system.controller";

export { BaseController, SystemController };

export default {
  Base: BaseController,
  System: SystemController,
};
