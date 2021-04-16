/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

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
  const router = useRouter();
  const contentHtml = RichText.asHtml(post.data.content[0].body);
  const calculateTextTimeReading = () => {
    const contentText = RichText.asText(post.data.content[0].body);
    const textSize = contentText.split(' ').length;
    const calculatedValue = textSize / 200;
    const result = Math.round(calculatedValue * 100);

    return Math.ceil(result / 100);
  };

  return (
    <>
      <Header />
      {router.isFallback ? (
        <div>
          <h1>Carregando...</h1>
        </div>
      ) : (
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
                <p>{`${calculateTextTimeReading()} min`}</p>
              </div>
            </div>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 100,
    }
  );

  return {
    paths: [
      {
        params: { slug: posts.results[0].uid },
      },
      {
        params: { slug: posts.results[1].uid },
      },
    ],
    fallback: true,
  };
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
  const postContent = data.content.map(el => {
    return {
      heading: el.heading,
      body: el.body,
    };
  });
  // console.log('test :: ', JSON.stringify(test));
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
      content: postContent,
    },
  };
  // console.log(JSON.stringify(post));
  return {
    props: { post },
  };
};
