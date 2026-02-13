const SubpageBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: 'hsl(220, 70%, 8%)' }}>
      {/* Top-left crimson glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-40"
        style={{
          background: 'radial-gradient(circle, hsl(340, 70%, 35%) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
        }}
      />
      {/* Center teal swirl */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-[140px] opacity-30"
        style={{
          background: 'radial-gradient(circle, hsl(195, 60%, 30%) 0%, transparent 70%)',
          top: '30%',
          left: '30%',
        }}
      />
      {/* Bottom-right crimson glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-45"
        style={{
          background: 'radial-gradient(circle, hsl(345, 65%, 30%) 0%, transparent 70%)',
          bottom: '5%',
          right: '-5%',
        }}
      />
      {/* Subtle deep navy overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, hsl(220, 70%, 8%) 80%)',
        }}
      />
    </div>
  );
};

export default SubpageBackground;
