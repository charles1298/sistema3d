-- Senha: 123456
INSERT OR IGNORE INTO "Usuario" (id, nome, email, senha, role, cor, "criadoEm")
VALUES
  ('user-admin', 'Admin',         'admin@3dsistema.com',   '$2b$10$JcgZgkvoFLpwAmsP6nNi1.IYVybSRH0QENiZz2GBLJxGuigseqmkK', 'admin',  '#00AE68', datetime('now')),
  ('user-1',     'Ana Silva',     'membro1@3dsistema.com', '$2b$10$JcgZgkvoFLpwAmsP6nNi1.IYVybSRH0QENiZz2GBLJxGuigseqmkK', 'membro', '#3B82F6', datetime('now')),
  ('user-2',     'Carlos Souza',  'membro2@3dsistema.com', '$2b$10$JcgZgkvoFLpwAmsP6nNi1.IYVybSRH0QENiZz2GBLJxGuigseqmkK', 'membro', '#8B5CF6', datetime('now')),
  ('user-3',     'Diego Lima',    'membro3@3dsistema.com', '$2b$10$JcgZgkvoFLpwAmsP6nNi1.IYVybSRH0QENiZz2GBLJxGuigseqmkK', 'membro', '#F59E0B', datetime('now')),
  ('user-4',     'Fernanda Costa','membro4@3dsistema.com', '$2b$10$JcgZgkvoFLpwAmsP6nNi1.IYVybSRH0QENiZz2GBLJxGuigseqmkK', 'membro', '#EF4444', datetime('now'));

INSERT OR IGNORE INTO "Projeto" (id, nome, descricao, status, cor, "criadoPorId", "criadoEm", "atualizadoEm")
VALUES
  ('proj-1', 'Pecas para Drone',     'Impressao de pecas de reposicao e melhorias para o drone da equipe', 'ativo', '#00AE68', 'user-admin', datetime('now'), datetime('now')),
  ('proj-2', 'Suportes de Bancada',  'Suportes e organizadores para a bancada de trabalho',                'ativo', '#3B82F6', 'user-1',     datetime('now'), datetime('now')),
  ('proj-3', 'Prototipo Robotica',   'Pecas para o prototipo de braco robotico',                           'ativo', '#8B5CF6', 'user-2',     datetime('now'), datetime('now'));

INSERT OR IGNORE INTO "OrdemProducao" (id, titulo, descricao, status, prioridade, estimativa, material, "projetoId", "usuarioId", "criadoEm", "atualizadoEm")
VALUES
  ('ord-1', 'Helice frontal esquerda',   'Reimprimir helice danificada', 'concluido',  'alta',  45,  'PLA Branco',  'proj-1', 'user-admin', datetime('now'), datetime('now')),
  ('ord-2', 'Suporte de bateria',        'Suporte para bateria LiPo 3S', 'imprimindo', 'alta',  90,  'PETG Preto',  'proj-1', 'user-3',     datetime('now'), datetime('now')),
  ('ord-3', 'Organizador de ferramentas','Grid modular para ferramentas','pendente',   'media', 180, 'PLA Cinza',   'proj-2', 'user-1',     datetime('now'), datetime('now')),
  ('ord-4', 'Suporte para osciloscopio', NULL,                           'pendente',   'baixa', 60,  'PLA Preto',   'proj-2', 'user-1',     datetime('now'), datetime('now')),
  ('ord-5', 'Junta do cotovelo v2',      'Nova versao com folga reduzida','pendente',  'alta',  240, 'PETG Natural','proj-3', 'user-2',     datetime('now'), datetime('now'));
