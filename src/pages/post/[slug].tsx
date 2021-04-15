import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={`${post.data.title} banner`}
      />
      <main className={commonStyles.container}>
        <h1>{post.data.title}</h1>
        <div className={commonStyles.contentFooter}>
          <div>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
          </div>
          <div>
            <FiUser />
            <p>{post.data.author}</p>
          </div>
          <div>
            <FiClock />
            <p>4 min</p>
          </div>
        </div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
        />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');
  return {
    paths: [],
    fallback: 'blocking',
  };
  // TODO
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  // console.log(context.params);

  const response = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );
  const { data, first_publication_date } = response;
  const post = {
    first_publication_date: new Date(first_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ),
    data: {
      title: data.title,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: {
        heading: data.content[0].heading,
        body: {
          text: RichText.asHtml(data.content[0].body),
        },
      },
    },
  };
  // console.log(JSON.stringify(post));
  return {
    props: { post },
  };
};
