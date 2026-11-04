import { SplitText } from './SplitText';
import { cn } from '@/lib/utils';

type Props = {
  index?: string; // "02"
  total?: string; // "06"
  label: string;
  title: string; // supports *emphasis*
  intro?: string;
  className?: string;
  align?: 'left' | 'right';
  size?: 'h1' | 'h2';
  id?: string;
};

/** Editorial heading: section counter, 1px rule, tiny label, giant display line. */
export function SectionHeading({ index, total, label, title, intro, className, align = 'left', size = 'h2', id }: Props) {
  return (
    <header className={cn('grid grid-cols-12 gap-x-4', className)}>
      <div className="col-span-12 mb-8 flex items-center gap-4 md:mb-12">
        {index && (
          <span className="label label-ink tnum">
            {index}
            {total && <span className="text-muted"> / {total}</span>}
          </span>
        )}
        <span className="rule max-w-[72px]" />
        <span className="label">{label}</span>
      </div>
      <SplitText
        as="h2"
        id={id}
        text={title}
        className={cn('display', size === 'h1' ? 't-h1' : 't-h2', 'col-span-12', align === 'right' ? 'lg:col-start-4 lg:col-span-9' : 'lg:col-span-10')}
      />
      {intro && <p className={cn('prose-body col-span-12 mt-8 md:col-span-7', align === 'right' ? 'lg:col-start-6 lg:col-span-5' : 'lg:col-span-5')}>{intro}</p>}
    </header>
  );
}
