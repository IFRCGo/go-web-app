import { useCallback, useState, useEffect, useRef } from 'react';
import csvParse from 'csv-parse/lib/sync';
import {
  ListResponse,
  useLazyRequest,
  useRequest,
} from './index';

import { TransformedError } from './go';

const PAGE_SIZE = 500;

const firstQuery = {
  format: 'json',
  limit: 1,
  offset: 0,
};

function useRecursiveCSVRequest<D>({
  url,
  onFailure,
} : {
  url: string;
  onFailure: (error: TransformedError) => void,
}) {
  const [pending, setPending] = useState(false);
  const [data, setData] = useState<D[]>([]);
  const [skipCsvRequest, setSkipCsvRequest] = useState(true);
  const [csvQuery, setCsvQuery] = useState({
    format: 'csv',
    offset: 0,
    limit: PAGE_SIZE,
  });

  const {
    response: currentResponse,
  } = useRequest<string>({
    url,
    skip: skipCsvRequest,
    query: csvQuery,
    isCsvRequest: true,
    onFailure: (error) => {
      // NOTE: Clear all values
      setData([]);
      requestCountRef.current = 0;
      setPending(false);
      setSkipCsvRequest(true);
      setCsvQuery({
        format: 'csv',
        offset: 0,
        limit: PAGE_SIZE,
      });

      onFailure(error);
    },
  });

  const {
    trigger: triggerRequestForCount,
  } = useLazyRequest<ListResponse<D>>({
    url,
    query: firstQuery,
    onSuccess: (response) => {
      totalRef.current = response.count;
      requestCountRef.current = 1;
      setSkipCsvRequest(false);
    },
    onFailure: (error) => {
      setPending(false);
      onFailure(error);
    },
  });

  const totalRef = useRef(0);
  const requestCountRef = useRef(0);

  useEffect(() => {
    if (!currentResponse) {
      return;
    }
    const offset = requestCountRef.current * PAGE_SIZE;

    if (offset <= totalRef.current) {
      // NOTE: New data is requested if offset is still less than total
      setCsvQuery({
        format: 'csv',
        offset,
        limit: PAGE_SIZE,
      });
    } else {
      // NOTE: Reset pending, and csv query options after CSV requests are done
      setPending(false);
      setSkipCsvRequest(true);
      setCsvQuery({
        format: 'csv',
        offset: 0,
        limit: PAGE_SIZE,
      });
      requestCountRef.current=0;
    }

    const rows = csvParse(currentResponse, {
      columns: true,
    });
    setData((prevData) => [...prevData, ...rows]);

    ++requestCountRef.current;
  }, [currentResponse]);

  const trigger = useCallback(() => {
    // NOTE: Clearing data during trigger as data and total are preserved outputs
    setData([]);
    totalRef.current=0;
    triggerRequestForCount(null);
    setPending(true);
  }, [triggerRequestForCount]);

  return [pending, data, totalRef.current, trigger];
}

export default useRecursiveCSVRequest;
