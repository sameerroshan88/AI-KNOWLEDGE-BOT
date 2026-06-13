import AnimatedSocialLinks, { type Social } from '@/components/ui/social-links';

const AnimatedSocialLinksDemo = () => {
  const socials: Social[] = [
    {
      name: 'Instagram',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    },
    {
      name: 'LinkedIn',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    },
    {
      name: 'YouTube',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg',
    },
    {
      name: 'Facebook',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
    },
  ];

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-black px-4 py-10">
      <AnimatedSocialLinks socials={socials} />
    </main>
  );
};

export { AnimatedSocialLinksDemo as DemoOne };
