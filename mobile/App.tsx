import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StatusBar, Text, TextInput, View } from 'react-native';
import { api, clearToken, getToken, login } from './src/api';
import { colors } from './src/tokens';

type Me = { id: string; name: string | null; email: string };
type Notice = { id: string; title: string; organization?: { name: string } | null; applicationEndDate?: string | null };

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [booting, setBooting] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<Notice[]>([]);

  useEffect(() => {
    (async () => {
      if (await getToken()) { const r = await api('/api/mobile/me'); if (r.ok) setMe(r.data.user); else await clearToken(); }
      setBooting(false);
    })();
  }, []);
  useEffect(() => { if (me) api<Notice[]>('/api/notifications').then((r) => setJobs(Array.isArray(r.data) ? r.data.filter((j: any) => j.published) : [])); }, [me]);

  const submit = async () => {
    setBusy(true); setError('');
    const r = await login(email, password);
    if (r.ok && r.data.user) setMe(r.data.user as Me); else setError(r.data.message ?? 'Could not log in.');
    setBusy(false);
  };

  if (booting) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

  if (!me) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral[50], justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.neutral[900] }}>GovMatch</Text>
      <Text style={{ marginTop: 4, marginBottom: 20, color: colors.neutral[600] }}>Log in to see jobs that match you.</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={input} />
      {!!error && <Text style={{ color: colors.danger, marginBottom: 8 }}>{error}</Text>}
      <Pressable onPress={submit} disabled={busy} style={{ backgroundColor: colors.primary[600], padding: 14, borderRadius: 8, opacity: busy ? 0.6 : 1 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{busy ? 'Logging in...' : 'Log in'}</Text>
      </Pressable>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral[50] }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.neutral[900] }}>Hello, {me.name?.split(' ')[0] ?? 'there'}</Text>
        <Pressable onPress={async () => { await clearToken(); setMe(null); }}><Text style={{ color: colors.primary[600] }}>Log out</Text></Pressable>
      </View>
      <FlatList data={jobs} keyExtractor={(j) => j.id} contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={{ color: colors.neutral[600] }}>No jobs yet.</Text>}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.neutral[200] }}>
            <Text style={{ fontWeight: '600', color: colors.neutral[900] }}>{item.title}</Text>
            <Text style={{ marginTop: 2, color: colors.neutral[600] }}>{item.organization?.name}</Text>
          </View>
        )} />
    </SafeAreaView>
  );
}

const input = { borderWidth: 1, borderColor: colors.neutral[200], backgroundColor: 'white', borderRadius: 8, padding: 12, marginBottom: 10 } as const;
