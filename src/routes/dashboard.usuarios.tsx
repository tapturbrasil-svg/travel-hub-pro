import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  UserCog,
  Plus,
  Search,
  Shield,
  Mail,
  Edit,
  Trash2,
  X,
  Check,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/usuarios")({
  component: UsuariosPage,
  head: () => ({ meta: [{ title: "Usuários | TapTur" }] }),
});

type Role = "admin" | "operador" | "vendedor" | "financeiro";
type UserStatus = "ativo" | "inativo" | "pendente";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  created_at: string;
  last_login?: string;
  sales_count?: number;
  revenue?: number;
  agencies?: { name: string };
};

const ROLE_CONFIG: Record<Role, { label: string; className: string; permissions: string[] }> = {
  admin: {
    label: "Admin",
    className: "bg-primary/10 text-primary",
    permissions: ["Todas as permissões", "Gerenciar usuários", "Configurações"],
  },
  operador: {
    label: "Operador",
    className: "bg-blue-500/10 text-blue-600",
    permissions: ["Gerenciar viagens", "Visualizar reservas", "Editar passageiros"],
  },
  vendedor: {
    label: "Vendedor",
    className: "bg-success/10 text-success",
    permissions: ["Visualizar viagens", "Criar reservas", "Gerenciar leads"],
  },
  financeiro: {
    label: "Financeiro",
    className: "bg-warning/10 text-warning",
    permissions: ["Visualizar financeiro", "Gerenciar pagamentos", "Relatórios"],
  },
};

const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Gabriel Martins",
    email: "gabriel@agencia.com",
    phone: "(11) 98765-4321",
    role: "admin",
    status: "ativo",
    created_at: "2025-01-15",
    last_login: "2026-04-27",
    sales_count: 156,
    revenue: 198420,
    agencies: { name: "TapTur" },
  },
  {
    id: "u2",
    name: "Fernanda Costa",
    email: "fernanda@agencia.com",
    phone: "(11) 99876-5432",
    role: "operador",
    status: "ativo",
    created_at: "2025-06-20",
    last_login: "2026-04-26",
    sales_count: 89,
    revenue: 112340,
    agencies: { name: "TapTur" },
  },
  {
    id: "u3",
    name: "Rafael Oliveira",
    email: "rafael@agencia.com",
    phone: "(11) 97654-3210",
    role: "vendedor",
    status: "ativo",
    created_at: "2025-09-10",
    last_login: "2026-04-27",
    sales_count: 134,
    revenue: 178500,
    agencies: { name: "TapTur" },
  },
  {
    id: "u4",
    name: "Carla Santos",
    email: "carla@agencia.com",
    phone: "(11) 96543-2109",
    role: "financeiro",
    status: "ativo",
    created_at: "2025-11-05",
    last_login: "2026-04-25",
    agencies: { name: "TapTur" },
  },
  {
    id: "u5",
    name: "Lucas Pereira",
    email: "lucas@agencia.com",
    phone: "(11) 95432-1098",
    role: "vendedor",
    status: "inativo",
    created_at: "2026-01-20",
    last_login: "2026-03-15",
    sales_count: 23,
    revenue: 28900,
    agencies: { name: "TapTur" },
  },
  {
    id: "u6",
    name: "Amanda Lima",
    email: "amanda.lima@agencia.com",
    phone: "(11) 94321-0987",
    role: "operador",
    status: "pendente",
    created_at: "2026-04-26",
    agencies: { name: "TapTur" },
  },
];

const ROLE_OPTIONS: Role[] = ["admin", "operador", "vendedor", "financeiro"];

function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*, agencies(name)")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading users:", error);
      setUsers(MOCK_USERS);
    } else if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || u.role === roleFilter;
    const matchStatus = statusFilter === "todos" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    ativos: users.filter((u) => u.status === "ativo").length,
    inativos: users.filter((u) => u.status === "inativo").length,
    pendentes: users.filter((u) => u.status === "pendente").length,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Usuários</h1>
          <p className="mt-2 text-muted-foreground">
            Convide colaboradores, defina papéis e permissões dentro da agência.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsInviteOpen(true)}>
            <Mail className="h-4 w-4" /> Convidar por e-mail
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de usuários" value={stats.total} />
        <StatCard label="Ativos" value={stats.ativos} color="text-success" />
        <StatCard label="Inativos" value={stats.inativos} color="text-muted-foreground" />
        <StatCard label="Pendentes" value={stats.pendentes} color="text-warning" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="todos">Todos os cargos</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_CONFIG[r].label}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <UserCog className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cargo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Último acesso
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => {
                const role = ROLE_CONFIG[user.role];
                return (
                  <tr key={user.id} className="transition-colors hover:bg-surface-elevated">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary font-medium text-sm">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={role.className}>{role.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            user.status === "ativo"
                              ? "bg-success"
                              : user.status === "pendente"
                              ? "bg-warning"
                              : "bg-muted"
                          }`}
                        />
                        <span className="text-sm capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const newStatus = user.status === "ativo" ? "inativo" : "ativo";
                            await supabase
                              .from("users")
                              .update({ status: newStatus })
                              .eq("id", user.id);
                            setUsers((prev) =>
                              prev.map((u) =>
                                u.id === user.id ? { ...u, status: newStatus } : u
                              )
                            );
                          }}
                        >
                          {user.status === "ativo" ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4 text-success" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <UserPermissionsModal
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        onSave={(userId, role) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role } : u))
          );
        }}
      />

      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={async (newUser) => {
          const { data, error } = await supabase
            .from("users")
            .insert([{ ...newUser, status: "pendente" }])
            .select()
            .single();
          
          if (error) {
            console.error("Error creating user:", error);
            return;
          }
          
          if (data) {
            setUsers((prev) => [...prev, data]);
          }
          setIsCreateOpen(false);
        }}
      />

      <InviteUserDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl font-semibold ${color || ""}`}>{value}</p>
    </div>
  );
}

function UserPermissionsModal({
  open,
  onOpenChange,
  user,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (userId: string, role: Role) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role>(user?.role || "operador");

  if (!user) return null;

  const role = ROLE_CONFIG[user.role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl">Permissões</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_CONFIG[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-3 font-medium">Permissões do cargo</h4>
            <div className="space-y-3">
              {ROLE_CONFIG[selectedRole].permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={async () => { 
            await supabase
              .from("users")
              .update({ role: selectedRole })
              .eq("id", user.id);
            onSave(user.id, selectedRole); 
            onOpenChange(false); 
          }}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: Omit<User, "id" | "created_at" | "last_login" | "sales_count" | "revenue" | "agencies">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "operador" as Role,
    status: "pendente" as UserStatus,
  });

  const handleSave = () => {
    onSave(form);
    setForm({ name: "", email: "", phone: "", role: "operador", status: "pendente" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome do colaborador"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@agencia.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_CONFIG[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!form.name || !form.email}>
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("vendedor");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const { error } = await supabase
      .from("users")
      .insert([{ email, role, status: "pendente" }]);

    setSending(false);
    setEmail("");
    setRole("vendedor");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar por e-mail</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>E-mail do convidado</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colaborador@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_CONFIG[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            O convidado receberá um e-mail com um link para criar sua conta.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={!email || sending}>
            {sending ? "Enviando..." : "Enviar convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}