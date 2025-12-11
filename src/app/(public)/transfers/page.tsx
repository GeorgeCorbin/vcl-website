import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";

export default function TransfersPage() {
  // TODO: Fetch transfers from API
  const transfers: Array<{
    id: string;
    playerName: string;
    fromTeam: { name: string } | null;
    toTeam: { name: string } | null;
    position: string | null;
    classYear: string | null;
    notes: string | null;
    confirmed: boolean;
    createdAt: string;
  }> = [];

  const confirmedTransfers = transfers.filter((t) => t.confirmed);
  const rumoredTransfers = transfers.filter((t) => !t.confirmed);

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          Transfer Tracker
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Track player movements between club lacrosse programs.
        </p>
      </div>

      {transfers.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No transfers recorded yet. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Confirmed Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Confirmed Transfers
                <Badge>{confirmedTransfers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmedTransfers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No confirmed transfers yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Transfer</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmedTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          {transfer.playerName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {transfer.fromTeam?.name || "Unknown"}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {transfer.toTeam?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{transfer.position || "—"}</TableCell>
                        <TableCell>{transfer.classYear || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {transfer.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Rumored Transfers */}
          {rumoredTransfers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Rumored / Unconfirmed
                  <Badge variant="secondary">{rumoredTransfers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Transfer</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rumoredTransfers.map((transfer) => (
                      <TableRow key={transfer.id} className="opacity-75">
                        <TableCell className="font-medium">
                          {transfer.playerName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {transfer.fromTeam?.name || "Unknown"}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.toTeam?.name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transfer.position || "—"}</TableCell>
                        <TableCell>{transfer.classYear || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {transfer.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
