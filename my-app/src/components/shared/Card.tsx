import { Link } from 'react-router-dom';
import { Card as AntCard, Tag, Button } from 'antd';
import { createStyles } from 'antd-style';



const useStyles = createStyles(({ token }) => ({
  root: {
    width: 335,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }
  },
  cover: {
    height: 180,
    padding: 16,
    paddingBottom: 0,
    '& img': {
        borderRadius: 8,
        objectFit: 'cover',
        height: '100%',
        width: '100%',
    }
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 16,
  },
  description: {
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: 16,
    color: token.colorTextSecondary,
  },
  tags: {
    marginTop: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  }
}));

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  link?: string;
  category?: string;
}

function Card({ title, description, imageUrl, tags = [], link = '', category = '' }: CardProps) {
  const { styles } = useStyles();

  return (
    <AntCard
      hoverable
      variant="borderless"
      className={styles.root}
      cover={
        <div className={styles.cover}>
             <img alt={title} src={imageUrl} />
        </div>
      }
      styles={{
        body: { padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }
      }}
      title={<span className="text-[#044CC8] font-bold text-lg">{title}</span>}
      extra={
        link && (
            <Link to={link}>
                <Button type="link" size="small" style={{ padding: 0 }}>Xem thêm</Button>
            </Link>
        )
      }
    >
        <div className={styles.description}>
            {description}
        </div>
        
        {(tags.length > 0 || category) && (
            <div className={styles.tags}>
                {category && <Tag color="blue">#{category}</Tag>}
                {tags.map(tag => (
                   <Tag key={tag}>#{tag}</Tag> 
                ))}
            </div>
        )}
    </AntCard>
  );
}

export default Card;
