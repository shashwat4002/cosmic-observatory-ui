import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, Send, Check, X, User,
  GraduationCap, Briefcase, Star, MapPin, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  institution: string | null;
  expertise_areas: string[] | null;
  research_interests: string[] | null;
  is_available_for_mentoring: boolean;
}

interface MatchRequest {
  id: string;
  requester_id: string;
  target_id: string;
  match_type: string;
  status: string;
  message: string | null;
  response_message: string | null;
  created_at: string;
  requester?: UserProfile;
  target?: UserProfile;
}

export default function Matching() {
  const { user, profile } = useAuth();
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [peers, setPeers] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMentors();
    fetchPeers();
    if (user) {
      fetchMatchRequests();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .eq('is_available_for_mentoring', true)
        .neq('id', user?.id || '');

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .neq('id', user?.id || '')
        .limit(20);

      if (error) throw error;
      setPeers(data || []);
    } catch (error) {
      console.error('Error fetching peers:', error);
    }
  };

  const fetchMatchRequests = async () => {
    if (!user) return;

    try {
      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase
        .from('match_requests')
        .select(`
          *,
          target:profiles!match_requests_target_id_fkey(*)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;
      setSentRequests(sent || []);

      // Fetch received requests
      const { data: received, error: receivedError } = await supabase
        .from('match_requests')
        .select(`
          *,
          requester:profiles!match_requests_requester_id_fkey(*)
        `)
        .eq('target_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;
      setReceivedRequests(received || []);
    } catch (error) {
      console.error('Error fetching match requests:', error);
    }
  };

  const sendMatchRequest = async (matchType: 'mentor' | 'peer') => {
    if (!user || !selectedUser) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('match_requests')
        .insert({
          requester_id: user.id,
          target_id: selectedUser.id,
          match_type: matchType,
          message: requestMessage.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You already have a pending request with this user');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Request sent successfully!');
      setSelectedUser(null);
      setRequestMessage('');
      fetchMatchRequests();
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request');
    } finally {
      setIsSending(false);
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('match_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(accept ? 'Request accepted!' : 'Request declined');
      fetchMatchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    }
  };

  const filteredMentors = mentors.filter((mentor) =>
    mentor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise_areas?.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPeers = peers.filter((peer) =>
    peer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peer.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peer.research_interests?.some((interest) => interest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasPendingRequest = (targetId: string) => {
    return sentRequests.some((r) => r.target_id === targetId && r.status === 'pending');
  };

  return (
    <DashboardLayout title="Matching" subtitle="Connect with mentors and peers">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, institution, or interests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-input border-border"
        />
      </div>

      <Tabs defaultValue="mentors" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="mentors">
            <Briefcase className="w-4 h-4 mr-2" />
            Find Mentors
          </TabsTrigger>
          <TabsTrigger value="peers">
            <GraduationCap className="w-4 h-4 mr-2" />
            Find Peers
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Users className="w-4 h-4 mr-2" />
            Requests
            {receivedRequests.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{receivedRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Mentors Tab */}
        <TabsContent value="mentors">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No mentors found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Mentors will be available soon'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      {mentor.avatar_url ? (
                        <img
                          src={mentor.avatar_url}
                          alt={mentor.full_name || 'Mentor'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{mentor.full_name || 'Anonymous'}</h3>
                      {mentor.institution && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {mentor.institution}
                        </p>
                      )}
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mentor.bio}</p>
                  )}

                  {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.expertise_areas.slice(0, 3).map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={hasPendingRequest(mentor.id)}
                    onClick={() => setSelectedUser(mentor)}
                  >
                    {hasPendingRequest(mentor.id) ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Pending
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Request Mentorship
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Peers Tab */}
        <TabsContent value="peers">
          {filteredPeers.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No peers found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Peers will be available soon'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeers.map((peer, index) => (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                      {peer.avatar_url ? (
                        <img
                          src={peer.avatar_url}
                          alt={peer.full_name || 'Peer'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-secondary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{peer.full_name || 'Anonymous'}</h3>
                      {peer.institution && (
                        <p className="text-sm text-muted-foreground">{peer.institution}</p>
                      )}
                    </div>
                  </div>

                  {peer.research_interests && peer.research_interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {peer.research_interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={hasPendingRequest(peer.id)}
                    onClick={() => setSelectedUser(peer)}
                  >
                    {hasPendingRequest(peer.id) ? 'Request Pending' : 'Connect'}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <div className="space-y-6">
            {/* Received Requests */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Pending Requests</h3>
              {receivedRequests.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div key={request.id} className="glass rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            {request.requester?.avatar_url ? (
                              <img
                                src={request.requester.avatar_url}
                                alt={request.requester.full_name || 'User'}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {request.requester?.full_name || 'Anonymous'}
                            </h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {request.match_type} request
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToRequest(request.id, false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => respondToRequest(request.id, true)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {request.message && (
                        <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
                          {request.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Sent Requests</h3>
              {sentRequests.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No sent requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="glass rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {request.target?.avatar_url ? (
                            <img
                              src={request.target.avatar_url}
                              alt={request.target.full_name || 'User'}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {request.target?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{request.match_type}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          request.status === 'accepted' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle>Send Connection Request</DialogTitle>
            <DialogDescription>
              Send a request to connect with {selectedUser?.full_name || 'this user'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add a personal message (optional)..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="bg-input border-border min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button
              onClick={() => sendMatchRequest(selectedUser?.role === 'mentor' ? 'mentor' : 'peer')}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
