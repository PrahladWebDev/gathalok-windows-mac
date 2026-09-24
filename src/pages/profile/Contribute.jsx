import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from '../../ui/primitives';
import Screen from '../../ui/Screen';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Flag from '../../ui/Flag';
import { DetailSkeleton } from '../../ui/Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation, useRoute } from '../../router/navAdapter';
import { haptic } from '../../utils/desktop';
import api from '../../api/client';
import { CATEGORIES } from '../../data/categories';
import { COUNTRIES } from '../../data/countries';

const STEPS = ['Basics', 'The Story', 'Media & Tags', 'Review'];
const EMPTY_FORM = {
  title: '', alternativeNames: '', country: '', category: '',
  shortDescription: '', fullStory: '', origin: '', significance: '',
  coverImage: null, tags: '', references: '',
};

function TextArea({ label, hint, value, onChangeText, placeholder, rows = 4, maxLength }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ ...theme.typography.label, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        rows={rows}
        maxLength={maxLength}
        style={{
          border: `${theme.border.width}px solid ${theme.colors.border}`, borderRadius: theme.radius.md,
          padding: 12, minHeight: rows * 20, color: theme.colors.text,
          fontSize: 15, backgroundColor: theme.colors.surface,
        }}
      />
      <Text style={{ ...theme.typography.small, marginTop: 4, textAlign: 'right' }}>
        {hint || `${value.length}${maxLength ? `/${maxLength}` : ' characters'}`}
      </Text>
    </View>
  );
}

// Used for both a new submission (no storyId) and editing an existing one.
export default function Contribute() {
  const theme = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { params } = useRoute();
  const storyId = params?.id || null;
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const goToStep = (s) => { haptic.select(); setStep(s); };
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(!!storyId);

  useEffect(() => {
    if (!storyId) return;
    api.get(`/stories/id/${storyId}`)
      .then(({ data }) => {
        const s = data.data;
        setForm({
          title: s.title || '', alternativeNames: (s.alternativeNames || []).join(', '),
          country: s.country || '', category: s.category || '',
          shortDescription: s.shortDescription || '', fullStory: s.fullStory || '',
          origin: s.origin || '', significance: s.significance || '',
          coverImage: s.coverImage || null,
          tags: (s.tags || []).join(', '), references: (s.references || []).map((r) => (typeof r === 'string' ? r : (r.title || r.url || ''))).filter(Boolean).join('\n'),
        });
      })
      .catch(() => toast('Could not load this story for editing.', 'error'))
      .finally(() => setLoadingStory(false));
  }, [storyId]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const pickImage = () => fileInputRef.current?.click();

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file, file.name || 'cover.jpg');
      const { data } = await api.post('/upload/story-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((p) => ({ ...p, coverImage: data.data }));
    } catch (err) {
      haptic.error();
      toast('Image upload failed.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!form.title && !!form.country && !!form.category;
    if (step === 1) return !!form.shortDescription && form.fullStory.length >= 100;
    return true;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    alternativeNames: form.alternativeNames.split(',').map((s) => s.trim()).filter(Boolean),
    country: form.country,
    category: form.category,
    shortDescription: form.shortDescription.trim(),
    fullStory: form.fullStory.trim(),
    origin: form.origin.trim(),
    significance: form.significance.trim(),
    coverImage: form.coverImage,
    tags: form.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    references: form.references.split('\n').map((s) => s.trim()).filter(Boolean),
  });

  const handleSubmit = async (status) => {
    setLoading(true);
    try {
      const payload = { ...buildPayload(), status };
      if (storyId) {
        await api.put(`/stories/${storyId}`, payload);
        toast('Story updated!');
      } else {
        await api.post('/stories', payload);
        toast(status === 'draft' ? 'Saved as draft.' : 'Submitted for review!');
      }
      haptic.success();
      navigation.navigate('Contributions');
    } catch (err) {
      haptic.error();
      toast(err.message || 'Failed to submit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStory) {
    return <Screen title="Edit Story"><DetailSkeleton /></Screen>;
  }

  const chipStyle = (active, color) => ({
    padding: '8px 12px', borderRadius: 20, border: `1px solid ${active ? (color || theme.colors.accent) : theme.colors.border}`,
    marginRight: 8, marginBottom: 8, cursor: 'pointer', background: active ? (color || theme.colors.accent) : 'transparent',
  });

  return (
    <Screen title={storyId ? 'Edit Story' : 'Share Your Story'}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
      <View style={{ flexDirection: 'row', marginBottom: 20, maxWidth: 640 }}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
              backgroundColor: i <= step ? theme.colors.accent : theme.colors.border,
            }}>
              <Text style={{ color: i <= step ? theme.colors.onAccent : theme.colors.textFaint, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={{ ...theme.typography.small, marginTop: 4, textAlign: 'center' }}>{s}</Text>
          </View>
        ))}
      </View>

      <div style={{ maxWidth: 640 }}>
        {step === 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Input label="Story Title *" value={form.title} onChangeText={set('title')} placeholder="e.g. Bhangarh Fort, The Legend of Vetala" />
            <Input label="Alternative / Local Names" value={form.alternativeNames} onChangeText={set('alternativeNames')} placeholder="Comma-separated" />

            <Text style={{ ...theme.typography.label, marginBottom: 8 }}>Country *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {COUNTRIES.map((c) => (
                <button key={c.code} type="button" onClick={() => set('country')(c.name)} style={{ ...chipStyle(form.country === c.name), display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Flag code={c.code} size={16} />
                  <span style={{ color: form.country === c.name ? theme.colors.onAccent : theme.colors.text, fontSize: 13 }}>{c.name}</span>
                </button>
              ))}
            </View>

            <Text style={{ ...theme.typography.label, marginBottom: 8 }}>Category *</Text>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => set('category')(cat.slug)}
                  style={{
                    border: `1px solid ${form.category === cat.slug ? cat.color : theme.colors.border}`, borderRadius: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 6px', cursor: 'pointer',
                    background: form.category === cat.slug ? cat.color : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <span style={{ color: form.category === cat.slug ? '#fff' : theme.colors.text, fontSize: 11, marginTop: 4, textAlign: 'center' }}>{cat.name}</span>
                </button>
              ))}
            </View>
          </Card>
        )}

        {step === 1 && (
          <Card style={{ marginBottom: 16 }}>
            <TextArea label="Short Description * (max 400 chars — appears on cards)" value={form.shortDescription}
              onChangeText={(v) => set('shortDescription')(v.slice(0, 400))} rows={3} maxLength={400}
              placeholder="A compelling one-paragraph summary…" />
            <TextArea label="Full Story * (min 100 chars)" value={form.fullStory} onChangeText={set('fullStory')} rows={12}
              placeholder="Write the complete legend here. Include dialogue, historical context, the supernatural elements, and why it matters…" />
            <TextArea label="Historical Origin" value={form.origin} onChangeText={set('origin')} rows={3}
              placeholder="When and where did this legend originate?" />
            <TextArea label="Cultural Significance" value={form.significance} onChangeText={set('significance')} rows={3}
              placeholder="Why does this story matter to the community?" />
          </Card>
        )}

        {step === 2 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ ...theme.typography.label, marginBottom: 8 }}>Cover Image</Text>
            {form.coverImage ? (
              <View style={{ marginBottom: 16 }}>
                <Image source={{ uri: form.coverImage.url }} style={{ width: '100%', height: 200, borderRadius: theme.radius.md }} />
                <Button title="Remove" variant="outline" size="sm" onPress={() => set('coverImage')(null)} style={{ marginTop: 8 }} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadingImage}
                style={{
                  border: `1px dashed ${theme.colors.border}`, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  padding: '30px 20px', width: '100%',
                }}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={theme.colors.accent} />
                ) : (
                  <>
                    <Text style={{ fontSize: 26 }}>🖼</Text>
                    <Text style={{ ...theme.typography.body, marginTop: 6 }}>Click to upload cover image</Text>
                    <Text style={theme.typography.small}>JPG, PNG or WebP · Max 5MB</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            <Input label="Tags (comma-separated)" value={form.tags} onChangeText={set('tags')} placeholder="ghost, fort, rajasthan, haunted" containerStyle={{ marginTop: 16 }} />
            <TextArea label="References (one per line)" value={form.references} onChangeText={set('references')} rows={3} placeholder="Books, articles, or websites you used." />
          </Card>
        )}

        {step === 3 && (
          <Card style={{ marginBottom: 16 }}>
            {[
              ['Title', form.title || '—'],
              ['Country', form.country || '—'],
              ['Story Length', `${form.fullStory.length} characters`],
              ['Cover Image', form.coverImage ? '✅ Uploaded' : '⚠ None (optional)'],
              ['Tags', form.tags || 'None'],
            ].map(([label, value], i, arr) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}>
                <Text style={theme.typography.bodyMuted}>{label}</Text>
                <Text style={theme.typography.body}>{value}</Text>
              </View>
            ))}

            <View style={{ marginTop: 16, marginBottom: 6 }}>
              <Text style={theme.typography.caption}>✦ Our team reviews new stories within 1–3 days.</Text>
              <Text style={theme.typography.caption}>✦ You'll be notified when it's approved or needs changes.</Text>
            </View>

            <Button title="Save as Draft" variant="ghost" onPress={() => handleSubmit('draft')} loading={loading} style={{ marginTop: 10, width: '100%' }} />
            <Button
              title={loading ? 'Submitting…' : user?.role === 'admin' ? '🚀 Publish' : '🚀 Submit for Review'}
              onPress={() => handleSubmit('pending')}
              loading={loading}
              disabled={!form.title || !form.country || !form.category || !form.fullStory}
              style={{ marginTop: 10, width: '100%' }}
            />
          </Card>
        )}

        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          {step > 0 ? <Button title="← Back" variant="ghost" onPress={() => goToStep(step - 1)} style={{ flex: 1, marginRight: 8 }} /> : null}
          {step < STEPS.length - 1 ? (
            <Button title="Continue →" onPress={() => goToStep(step + 1)} disabled={!canProceed()} style={{ flex: 1 }} />
          ) : null}
        </View>
      </div>
    </Screen>
  );
}
