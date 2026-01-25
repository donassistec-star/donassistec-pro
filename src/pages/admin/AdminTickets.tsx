import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  Filter,
  X,
  Eye,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ticketsService, Ticket, TicketWithMessages } from "@/services/ticketsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMessages | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [filterStatus, filterPriority]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterPriority !== "all") filters.priority = filterPriority;

      const data = await ticketsService.getAll(filters);
      setTickets(data);
    } catch (error) {
      toast.error("Erro ao carregar tickets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      const ticket = await ticketsService.getById(ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    } catch (error) {
      toast.error("Erro ao carregar detalhes do ticket");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleSendMessage = async () => {
    if (!selectedTicket || !messageText.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    try {
      setSendingMessage(true);
      await ticketsService.addMessage(selectedTicket.id!, messageText);
      toast.success("Mensagem enviada com sucesso!");
      setMessageText("");
      
      // Recarregar detalhes do ticket
      if (selectedTicket.id) {
        await loadTicketDetails(selectedTicket.id);
      }
      
      // Recarregar lista
      await loadTickets();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar mensagem");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: Ticket["status"]) => {
    try {
      await ticketsService.update(ticketId, { status: newStatus });
      toast.success("Status atualizado com sucesso!");
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        await loadTicketDetails(ticketId);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    const variants: Record<Ticket["status"], "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "destructive",
    };
    
    const icons = {
      open: AlertCircle,
      in_progress: Clock,
      resolved: CheckCircle2,
      closed: X,
    };

    const labels = {
      open: "Aberto",
      in_progress: "Em Andamento",
      resolved: "Resolvido",
      closed: "Fechado",
    };

    const Icon = icons[status];
    return (
      <Badge variant={variants[status]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    const variants: Record<Ticket["priority"], "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "secondary",
      high: "default",
      urgent: "destructive",
    };

    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente",
    };

    return (
      <Badge variant={variants[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando tickets..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sistema de Suporte
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os tickets de suporte
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Tickets */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por assunto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as prioridades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as prioridades</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || filterStatus !== "all" || filterPriority !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterStatus("all");
                        setFilterPriority("all");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista */}
            {filteredTickets.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Nenhum ticket encontrado"
                description="Não há tickets para exibir no momento."
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className={`cursor-pointer transition-all ${
                          selectedTicket?.id === ticket.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => loadTicketDetails(ticket.id!)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{ticket.subject}</h3>
                                {getStatusBadge(ticket.status)}
                                {getPriorityBadge(ticket.priority)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {ticket.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDate(ticket.created_at || "")}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadTicketDetails(ticket.id!);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detalhes do Ticket */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{selectedTicket.subject}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                      <CardDescription>
                        Criado em {formatDate(selectedTicket.created_at || "")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Status Actions */}
                  <div>
                    <h4 className="font-semibold mb-2">Alterar Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.status !== "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedTicket.id!, "in_progress")}
                        >
                          Em Andamento
                        </Button>
                      )}
                      {selectedTicket.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedTicket.id!, "resolved")}
                        >
                          Resolver
                        </Button>
                      )}
                      {selectedTicket.status !== "closed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedTicket.id!, "closed")}
                        >
                          Fechar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div>
                    <h4 className="font-semibold mb-2">Mensagens</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedTicket.messages?.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.sender_type === "admin"
                              ? "bg-primary/10 ml-auto"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">
                              {message.sender_type === "admin" ? "Administrador" : "Lojista"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.created_at || "")}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enviar Mensagem */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageText.trim()}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendingMessage ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Selecione um ticket para ver os detalhes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTickets;
