import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

const TAG_SUGGESTIONS = ['react', 'typescript', 'tailwind', 'webdev', 'uiux'];

const PostCreate: React.FC = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle textarea auto-grow
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Handle media upload
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };
  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle tag input
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput('');
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  // Handle post submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Post cannot be empty');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setContent('');
      setTags([]);
      setMedia(null);
      setMediaPreview(null);
      setVisibility('Public');
      toast.success('Post shared!');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition" title="Bold"><b>B</b></button>
        <button type="button" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition" title="Italic"><i>I</i></button>
        <button type="button" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition" title="Emoji">😊</button>
        <button type="button" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition" title="Link">🔗</button>
        <button type="button" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition" title="Upload" onClick={() => fileInputRef.current?.click()}>📎</button>
        <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaChange} />
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="visibility" className="text-gray-400 text-sm mr-1">Visibility:</label>
          <select
            id="visibility"
            className="bg-gray-800 text-white rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            value={visibility}
            onChange={e => setVisibility(e.target.value)}
          >
            <option>Public</option>
            <option>Friends</option>
            <option>Private</option>
          </select>
        </div>
      </div>
      {/* Auto-growing textarea */}
      <textarea
        ref={textareaRef}
        className="w-full bg-gray-800 text-white rounded-xl resize-none p-3 focus:outline-none min-h-[60px] max-h-60 text-base placeholder-gray-400"
        placeholder="Share something..."
        value={content}
        onChange={handleContentChange}
        rows={1}
        required
      />
      {/* Media preview */}
      {mediaPreview && (
        <div className="relative mt-2 w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaPreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-gray-700" />
          <button type="button" onClick={removeMedia} className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1 text-white hover:bg-red-600 transition">×</button>
        </div>
      )}
      {/* Tag input and chips */}
      <div className="flex flex-wrap gap-2 items-center mt-2">
        {tags.map(tag => (
          <span key={tag} className="bg-blue-700 text-white px-3 py-1 rounded-full flex items-center text-sm shadow">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-xs hover:text-red-400">×</button>
          </span>
        ))}
        <input
          className="bg-gray-800 text-white rounded px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add tag"
          value={tagInput}
          onChange={e => setTagInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && tagInput) {
              e.preventDefault();
              addTag(tagInput.toLowerCase());
            }
          }}
          list="tag-suggestions"
        />
        <datalist id="tag-suggestions">
          {TAG_SUGGESTIONS.filter(s => !tags.includes(s)).map(s => (
            <option value={s} key={s} />
          ))}
        </datalist>
      </div>
      {/* Post button always bottom right */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold shadow-lg disabled:opacity-50 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none text-base"
          disabled={loading || !content.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default PostCreate; 